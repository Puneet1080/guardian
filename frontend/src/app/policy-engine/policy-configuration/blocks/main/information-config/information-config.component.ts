import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Schema, Token } from '@guardian/interfaces';
import { PolicyModel } from 'src/app/policy-engine/structures/policy.model';
import { PolicyBlockModel } from "src/app/policy-engine/structures/policy-block.model";
import { RegisteredBlocks } from 'src/app/policy-engine/registered-blocks';

/**
 * Settings for block of 'informationBlock' type.
 */
@Component({
    selector: 'information-config',
    templateUrl: './information-config.component.html',
    styleUrls: ['./information-config.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class InformationConfigComponent implements OnInit {
    @Input('policy') policy!: PolicyModel;
    @Input('block') currentBlock!: PolicyBlockModel;
    @Input('schemas') schemas!: Schema[];
    @Input('tokens') tokens!: Token[];
    @Input('readonly') readonly!: boolean;
    @Output() onInit = new EventEmitter();

    propHidden: any = {
        main: false,
    };

    block!: any;

    constructor(
        public registeredBlocks: RegisteredBlocks
    ) {
    }

    ngOnInit(): void {
        this.onInit.emit(this);
        this.load(this.currentBlock);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.load(this.currentBlock);
    }

    load(block: PolicyBlockModel) {
        this.block = block.properties;
        this.block.uiMetaData = this.block.uiMetaData || {}
    }

    onHide(item: any, prop: any) {
        item[prop] = !item[prop];
    }
}
