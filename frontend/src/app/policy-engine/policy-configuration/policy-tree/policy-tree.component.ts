import { Component, ComponentFactoryResolver, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { RegisteredBlocks } from '../../registered-blocks';
import { PolicyBlockModel } from "../../structures/policy-block.model";
import { BlocLine } from './structures/event-line';
import { BlockRect } from './structures/block-rect';
import { FlatBlockNode } from './structures/block-node';
import { EventCanvas } from './structures/event-canvas';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Settings for all blocks.
 */
@Component({
    selector: 'policy-tree',
    templateUrl: './policy-tree.component.html',
    styleUrls: ['./policy-tree.component.css']
})
export class PolicyTreeComponent implements OnInit {
    @Input('blocks') blocks!: PolicyBlockModel[];
    @Input('errors') errors!: any;
    @Input('readonly') readonly!: boolean;
    @Input('active') active!: string;

    @Output('delete') delete = new EventEmitter();
    @Output('select') select = new EventEmitter();
    @Output('reorder') reorder = new EventEmitter();
    @Output('open') open = new EventEmitter();

    @ViewChild('parent') parentRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('tooltip') tooltipRef!: ElementRef<HTMLDivElement>;

    public data!: FlatBlockNode[];

    private root!: PolicyBlockModel;
    private currentBlock!: PolicyBlockModel;
    private collapsedMap: Map<string, boolean> = new Map<string, boolean>();
    private eventsDisabled = false;
    private paddingLeft = 40;

    private tooltip!: HTMLDivElement;
    private canvas!: EventCanvas;
    private actorMap!: any;
    private tooltipTimeout!: any;

    private _allCollapse: string = '2';
    private _visibleMoveActions: string = '0';

    constructor(
        public registeredBlocks: RegisteredBlocks,
        private componentFactoryResolver: ComponentFactoryResolver,
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer
    ) {
        this.actorMap = {};
        this.actorMap[''] = 'Event Initiator';
        this.actorMap['owner'] = 'Document Owner';
        this.actorMap['issuer'] = 'Document Issuer';
    }

    public get allCollapse() {
        return this._allCollapse;
    }

    public set allCollapse(value: string) {
        if (this._allCollapse != value) {
            this._allCollapse = value;
            try {
                localStorage.setItem('POLICY_TREE_COLLAPSE', this._allCollapse);
            } catch (error) {
                console.error(error);
            }
        }
    }

    public get visibleMoveActions() {
        return this._visibleMoveActions;
    }

    public set visibleMoveActions(value: string) {
        if (this._visibleMoveActions != value) {
            this._visibleMoveActions = value;
            try {
                localStorage.setItem('POLICY_TREE_MENU', this._visibleMoveActions);
            } catch (error) {
                console.error(error);
            }
        }
    }

    ngOnInit(): void {
        this.collapsedMap.clear();
        try {
            this._allCollapse = '2';
            this._visibleMoveActions = '0';
            this._allCollapse = localStorage.getItem('POLICY_TREE_COLLAPSE') || '2';
            this._visibleMoveActions = localStorage.getItem('POLICY_TREE_MENU') || '1';
        } catch (error) {
            console.error(error)
        }
    }

    ngAfterViewInit(): void {
        this.tooltip = this.tooltipRef?.nativeElement;
        this.canvas = new EventCanvas(
            this.parentRef?.nativeElement,
            this.canvasRef?.nativeElement
        )
    }

    ngOnChanges(changes: SimpleChanges) {
        this.rebuildTree(this.blocks);
        if (changes.errors && this.errors) {
            this.setErrors(this.errors);
        }
    }

    rebuildTree(data: PolicyBlockModel[]) {
        this.root = data[0];
        this.data = this.convertToArray([], data, 0, null);
        this.render(true);
    }

    setErrors(errors: any) {

    }

    private getCollapsed(node: FlatBlockNode): boolean {
        if (node.expandable) {
            if (this.allCollapse === '2') {
                return true;
            }
            if (this.allCollapse === '1') {
                return false;
            }
            return this.collapsedMap.get(node.id) !== false;
        }
        return false;
    }

    convertToArray(
        result: FlatBlockNode[],
        blocks: PolicyBlockModel[],
        level: number,
        parent: any
    ): FlatBlockNode[] {
        if (!blocks) {
            return result;
        }
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const next = blocks[i - 1];
            const prev = blocks[i + 1];
            const node = new FlatBlockNode(block);
            node.prev = prev;
            node.next = next;
            node.level = level;
            node.root = block === this.root;
            node.expandable = block.expandable && !node.root;
            node.about = this.registeredBlocks.getAbout(block.blockType, block);
            node.icon = this.registeredBlocks.getIcon(block.blockType);
            node.type = this.registeredBlocks.getHeader(block.blockType);
            node.collapsed = this.getCollapsed(node);
            node.parent = parent;
            node.offset = `${this.paddingLeft * level}px`;

            result.push(node);
            this.collapsedMap.set(node.id, node.collapsed);

            if (!node.collapsed && (!block.isModule || node.root)) {
                result = this.convertToArray(
                    result,
                    block.children,
                    level + 1,
                    block
                );
            }
        }
        return result;
    }

    public isSelect(node: FlatBlockNode) {
        return this.currentBlock == node.node;
    }

    public isFinal(node: FlatBlockNode) {
        return node.node?.isFinal();
    }

    public isError(node: FlatBlockNode) {
        if (this.errors && this.errors[node.node.id]) {
            return true;
        }
        return false;
    }

    public onSelect(event: MouseEvent, node: FlatBlockNode) {
        this.currentBlock = node.node;
        this.render();
        this.select.emit(this.currentBlock);
        return false;
    }

    public onOpen(event: MouseEvent, node: FlatBlockNode) {
        this.open.emit(node.node);
        return false;
    }

    public onCollapse(event: MouseEvent, node: FlatBlockNode) {
        event.preventDefault();
        event.stopPropagation();
        this.allCollapse = '0';
        node.collapsed = !node.collapsed;
        this.collapsedMap.set(node.id, node.collapsed);
        this.rebuildTree(this.blocks);
        return false;
    }

    public mousemove(event: MouseEvent) {
        if (this.tooltip && this.canvas && this.canvas.valid) {
            const index = this.canvas.getIndexObject(event);
            const line = this.canvas.selectLine(index);
            if (line) {
                this.tooltip.innerHTML = `
                    <div class="s1"><span>Source (Block Tag)</span>: ${line.startTag}</div>
                    <div class="s2"><span>Output (Event)</span>: ${line.output}</div>
                    <div class="s3"><span>Target (Block Tag)</span>: ${line.endTag}</div>
                    <div class="s4"><span>Input (Event)</span>: ${line.input}</div>
                    <div class="s5"><span>Event Actor</span>: ${this.actorMap[line.actor]}</div>
                `;
                this.tooltip.style.left = `${event.offsetX}px`;
                this.tooltip.style.top = `${event.offsetY}px`;
                this.showTooltip(true);
            } else {
                this.tooltip.innerHTML = '';
                this.showTooltip(false);
            }
        } else {
            this.showTooltip(false);
        }
    }

    public mouseleave(event: MouseEvent) {
        if (this.canvas && this.canvas.valid) {
            this.canvas.selectLine(-1);
        }
        this.showTooltip(false);
    }

    private showTooltip(value: boolean) {
        if (this.tooltip) {
            clearTimeout(this.tooltipTimeout);
            if (value) {
                this.tooltip.style.display = 'block';
                this.tooltip.style.opacity = '0';
                this.tooltipTimeout = setTimeout(() => {
                    this.tooltip.style.opacity = '1';
                }, 500);
            } else {
                this.tooltip.style.display = 'none';
                this.tooltip.style.opacity = '0';
            }
        }
    }

    public render(fastClear = false) {
        if (this.canvas && this.canvas.valid) {
            if (fastClear) {
                this.canvas.clear();
            }
            if (this.active === 'None') {
                return;
            }
            setTimeout(() => {
                const boxCanvas = this.canvas.resize();
                const renderLine = this.createEventsLines(this.data, boxCanvas);
                this.canvas.setData(renderLine);
                this.canvas.render();
            });
        }
    }

    private createEventsLines(data: FlatBlockNode[], boxCanvas?: DOMRect): BlocLine[] {
        const blockMap: any = {};
        for (const block of data) {
            const div = document.querySelector(`.block-container[block-id="${block.id}"] .block-body`);
            if (block.name && div) {
                const box = div.getBoundingClientRect();
                const blocRect = new BlockRect(box, boxCanvas);
                blockMap[block.name] = blocRect;
            }
        }

        const lines: BlocLine[] = [];
        for (const node of data) {
            const block = node.node;
            if (
                !block.properties.stopPropagation &&
                node.about.defaultEvent &&
                this.checkType(block)
            ) {
                const sourceTag = block.tag;
                const targetTag = block.next?.tag || '';
                const start = blockMap[sourceTag];
                const end = blockMap[targetTag];
                if (start && end) {
                    const line = new BlocLine(start, end, true);
                    line.dash = false;
                    line.startTag = sourceTag;
                    line.endTag = targetTag;
                    line.actor = '';
                    line.input = 'RunEvent';
                    line.output = 'RunEvent';
                    lines.push(line);
                }
            }
            for (const event of block.events) {
                if (!event.disabled && this.checkType(event)) {
                    const start = blockMap[event.sourceTag];
                    const end = blockMap[event.targetTag];
                    if (start && end) {
                        const line = new BlocLine(start, end);
                        line.dash = event.input == 'RefreshEvent';
                        line.startTag = event.sourceTag;
                        line.endTag = event.targetTag;
                        line.actor = event.actor;
                        line.input = event.input;
                        line.output = event.output;
                        lines.push(line);
                    }
                }
            }
        }
        return this.sortLine(lines);
    }

    private checkType(item: any): boolean {
        if (this.active === 'All') {
            return true;
        }
        if (this.active === 'Action') {
            return item.input !== 'RefreshEvent';
        }
        if (this.active === 'Refresh') {
            return item.input === 'RefreshEvent';
        }
        return false;
    }

    private sortLine(lines: BlocLine[]): BlocLine[] {
        let shortLines = [];
        let otherLines = [];

        let minOffset = 0;
        for (const line of lines) {
            line.selectBlock(this.currentBlock?.tag);
            if (line.short) {
                shortLines.push(line);
            } else {
                otherLines.push(line);
            }
            minOffset = Math.max(minOffset, line.minOffset);
        }
        minOffset += 50;

        const renderLine = [];
        for (const line of shortLines) {
            line.calc(0);
            if (line.selected) {
                renderLine.push(line);
            } else {
                renderLine.unshift(line);
            }
        }

        otherLines = otherLines.sort((a, b) => a.height > b.height ? 1 : -1);

        const mapRight: any = {};
        for (const line of otherLines) {
            let offset = minOffset;
            for (let i = 0; mapRight[offset] && i < 200; i++) {
                offset += 8;
            }
            mapRight[offset] = true;
            line.calc(offset);
            if (line.selected) {
                renderLine.push(line);
            } else {
                renderLine.unshift(line);
            }
        }

        return renderLine;
    }

    onAllCollapse() {
        if (this.allCollapse === '2') {
            this.allCollapse = '1';
        } else {
            this.allCollapse = '2';
        }
        this.collapsedMap.clear();
        this.rebuildTree(this.blocks);
        return false;
    }

    onDelete(event: any) {
        throw '';
    }

    onVisibleMoreActions(event: any) {
        if (this.visibleMoveActions === '1') {
            this.visibleMoveActions = '0';
        } else {
            this.visibleMoveActions = '1';
        }
        this.render();
    }

    onDropUp(event: any) {
        throw '';
    }

    onDropDown(event: any) {
        throw '';
    }

    onDropLeft(event: any) {
        throw '';
    }

    onDropRight(event: any) {
        throw '';
    }
}
