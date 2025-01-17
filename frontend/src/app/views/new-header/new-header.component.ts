import { Component, Input, OnInit } from '@angular/core';
import { getMenuItems, NavbarMenuItem } from './menu.model';
import { IUser, UserRole } from '@guardian/interfaces';
import { AuthStateService } from '../../services/auth-state.service';
import { AuthService } from '../../services/auth.service';
import { DemoService } from '../../services/demo.service';
import { NavigationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProfileService } from '../../services/profile.service';
import { WebSocketService } from '../../services/web-socket.service';
import { HeaderPropsService } from '../../services/header-props.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../services/notify.service';
import { BrandingService } from '../../services/branding.service';

@Component({
    selector: 'app-new-header',
    templateUrl: './new-header.component.html',
    styleUrls: ['./new-header.component.scss'],
})
export class NewHeaderComponent implements OnInit {
    menuCollapsed: boolean = false;
    smallMenuMode: boolean = false;
    balance: string = '';
    menuItems: NavbarMenuItem[];

    activeLink: string = '';
    activeLinkRoot: string = '';
    role: any = null;
    isLogin: boolean = false;
    username: string | null = null;
    commonLinksDisabled: boolean = false;
    menuIcon: 'expand_more' | 'account_circle' = 'expand_more';
    testUsers$: Observable<any[]>;
    balanceType: string;
    balanceInit: boolean = false;
    ws!: any;
    authSubscription!: any;
    displayDemoAccounts: boolean = environment.displayDemoAccounts;
    hederaAccountID: string | undefined;
    profileData: IUser | null = null;
    mobileMenuOpen: boolean = false;
    subMenuOpen: any = {};
    userInfoVisible: boolean = false;

    @Input() remoteContainerMethod: any;

    constructor(public authState: AuthStateService,
                public auth: AuthService,
                public otherService: DemoService,
                public router: Router,
                public dialog: MatDialog,
                public profileService: ProfileService,
                public webSocketService: WebSocketService,
                public headerProps: HeaderPropsService,
                private notificationService: NotificationService,
                private brandingService: BrandingService) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.update();
            }
        })
        headerProps.isLoading$.subscribe(value => this.commonLinksDisabled = value);
    }

    ngOnInit(): void {
        this.update();
        this.ws = this.webSocketService.profileSubscribe((event) => {
            if (event.type === 'PROFILE_BALANCE') {
                if (event.data && event.data.balance) {
                    const b = parseFloat(event.data.balance);
                    this.balance = `${b.toFixed(3)} ${event.data.unit}`;
                } else {
                    this.balance = 'N\\A';
                    this.balanceType = '';
                }
            }
        }, () => {
            this.balance = 'N\\A';
            this.balanceType = '';
        });

        this.authSubscription = this.auth.subscribe((token) => {
            if (token) {
                this.getBalance();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.ws) {
            this.ws.unsubscribe();
            this.ws = null;
        }
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
            this.authSubscription = null;
        }
    }

    getBalance() {
        if (!this.isLogin) {
            return;
        }
        this.balanceInit = true;
        this.auth.balance().subscribe((balance: any) => {
            if (balance && balance.balance) {
                const b = parseFloat(balance.balance);
                if (b > 999) {
                    this.balance = `${b.toFixed(0)} ${balance.unit}`;
                } else if (b > 99) {
                    this.balance = `${b.toFixed(2)} ${balance.unit}`;
                } else if (b > 9) {
                    this.balance = `${b.toFixed(3)} ${balance.unit}`;
                }
                if (b > 100) {
                    this.balanceType = 'normal';
                } else if (b > 20) {
                    this.balanceType = 'warn';
                } else {
                    this.balanceType = 'error';
                }
            } else {
                this.balance = 'N\\A';
                this.balanceType = '';
            }
        }, () => {
            this.balance = 'N\\A';
            this.balanceType = '';
        });
    }

    async update() {
        if (this.activeLink === this.router.url) {
            return;
        }
        this.activeLink = this.router.url;
        this.activeLinkRoot = this.router.url.split('?')[0];
        this.auth.sessions().subscribe((user: IUser | null) => {
            const isLogin = !!user;
            const role = user ? user.role : null;
            const username = user ? user.username : null;
            this.setStatus(isLogin, role, username);
            this.authState.updateState(isLogin);
            if (!this.balanceInit) {
                this.getBalance();
            }
            if (!isLogin) {
                this.remoteContainerMethod('NO_MARGIN');
            } else {
                this.remoteContainerMethod(this.smallMenuMode ? 'COLLAPSE' : 'EXPAND');
            }
            this.brandingService.getBrandingData().then(res => {
                if (document.getElementById('company-logo') as HTMLImageElement) {
                    (document.getElementById('company-logo') as HTMLImageElement)!.src = res.companyLogoUrl;
                }

                if (document.getElementById('company-name')) {
                    document.getElementById('company-name')!.innerText = res.companyName;
                }

            })

        }, () => {
            this.setStatus(false, null, null);
        });
    }

    setStatus(isLogin: boolean, role: any, username: any) {
        if (this.isLogin !== isLogin || this.role !== role) {
            this.isLogin = isLogin;
            this.role = role;
            this.username = username;
            this.menuItems = getMenuItems(role as UserRole);
        }
    }

    logOut() {
        this.auth.removeAccessToken();
        this.auth.removeUsername();
        this.authState.updateState(false);
        this.router.navigate(['/login']);
    }

    toggleMenuMode() {
        this.smallMenuMode = !this.smallMenuMode;
        this.menuCollapsed = this.smallMenuMode;
        this.remoteContainerMethod(this.smallMenuMode ? 'COLLAPSE' : 'EXPAND');

        const fixedActionsContainer = document.getElementById('fixed-actions-container');
        if (fixedActionsContainer) {
            fixedActionsContainer.style.left = !this.smallMenuMode ? 'var(--header-width-expand)' : 'var(--header-width-collapse)'
        }
    }

    goToHomePage() {
        if (this.role === UserRole.STANDARD_REGISTRY) {
            this.router.navigate(['/config']);
        } else if (this.role === UserRole.USER) {
            this.router.navigate(['/user-profile']);
        }
    }

    goToBrandingPage(event: MouseEvent) {
        event.stopImmediatePropagation()
        this.router.navigate(['/branding']);
    }
}
