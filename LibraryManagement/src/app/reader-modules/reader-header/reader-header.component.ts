import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ListboxClickEvent } from 'primeng/listbox';
import { ISidebarItem } from 'src/app/models/sidebar-item.model';
import { HttpService } from 'src/app/services/http-service.service';
import { SessionService } from 'src/app/services/session.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-reader-header',
  templateUrl: './reader-header.component.html',
  styleUrls: ['./reader-header.component.css']
})
export class ReaderHeaderComponent implements OnInit {
  items: MenuItem[] | undefined;
  sidebarVisible: boolean = false;
  cities!: ISidebarItem[];

  selectedCity!: ISidebarItem;
  
  currentAccountPermission: any;
  // httpService: HttpService | undefined;
  constructor(
      private httpService: HttpService,
      private toastService: ToastService,
      private router: Router,
      private sessionService: SessionService
  ) {}

  ngOnInit() {
      this.items = [
          {
              label: 'File',
              icon: 'pi pi-fw pi-file',
              items: [
                  {
                      label: 'New',
                      icon: 'pi pi-fw pi-plus',
                      items: [
                          {
                              label: 'Bookmark',
                              icon: 'pi pi-fw pi-bookmark'
                          },
                          {
                              label: 'Video',
                              icon: 'pi pi-fw pi-video'
                          }
                      ]
                  },
                  {
                      label: 'Delete',
                      icon: 'pi pi-fw pi-trash'
                  },
                  {
                      separator: true
                  },
                  {
                      label: 'Export',
                      icon: 'pi pi-fw pi-external-link'
                  }
              ]
          },
          {
              label: 'Edit',
              icon: 'pi pi-fw pi-pencil',
              items: [
                  {
                      label: 'Left',
                      icon: 'pi pi-fw pi-align-left'
                  },
                  {
                      label: 'Right',
                      icon: 'pi pi-fw pi-align-right'
                  },
                  {
                      label: 'Center',
                      icon: 'pi pi-fw pi-align-center'
                  },
                  {
                      label: 'Justify',
                      icon: 'pi pi-fw pi-align-justify'
                  }
              ]
          },
          {
              label: 'Users',
              icon: 'pi pi-fw pi-user',
              items: [
                  {
                      label: 'New',
                      icon: 'pi pi-fw pi-user-plus'
                  },
                  {
                      label: 'Delete',
                      icon: 'pi pi-fw pi-user-minus'
                  },
                  {
                      label: 'Search',
                      icon: 'pi pi-fw pi-users',
                      items: [
                          {
                              label: 'Filter',
                              icon: 'pi pi-fw pi-filter',
                              items: [
                                  {
                                      label: 'Print',
                                      icon: 'pi pi-fw pi-print'
                                  }
                              ]
                          },
                          {
                              icon: 'pi pi-fw pi-bars',
                              label: 'List'
                          }
                      ]
                  }
              ]
          },
          {
              label: 'Events',
              icon: 'pi pi-fw pi-calendar',
              items: [
                  {
                      label: 'Edit',
                      icon: 'pi pi-fw pi-pencil',
                      items: [
                          {
                              label: 'Save',
                              icon: 'pi pi-fw pi-calendar-plus'
                          },
                          {
                              label: 'Delete',
                              icon: 'pi pi-fw pi-calendar-minus'
                          }
                      ]
                  },
                  {
                      label: 'Archieve',
                      icon: 'pi pi-fw pi-calendar-times',
                      items: [
                          {
                              label: 'Remove',
                              icon: 'pi pi-fw pi-calendar-minus'
                          }
                      ]
                  }
              ]
          },
          {
              label: 'Quit',
              icon: 'pi pi-fw pi-power-off'
          }
      ];
      
      this.currentAccountPermission = this.sessionService.getCurrentAccount();
  }

  sidebarToggle() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  sidebarClick(event: ListboxClickEvent) {
    this.router.navigate([`${event.option.code}`]);
    this.sidebarToggle();
  }

  logout() {
    this.sessionService.clearSession();
    this.router.navigate(['login']);
  }
}
