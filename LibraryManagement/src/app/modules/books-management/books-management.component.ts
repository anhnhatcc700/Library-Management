import { SessionService } from 'src/app/services/session.service';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from './service/book.service';
import { IBook, IBookSave } from 'src/app/models/book.model';
import { ConfirmDialogService } from 'src/app/services/confirm-dialog.service';
import { ToastService } from 'src/app/services/toast.service';
import { MessageType } from 'src/app/enums/toast-message.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { ICategories } from 'src/app/models/categories.model';
import { IComboboxOption } from 'src/app/models/combobox-option.model';
import { Observable, filter, first, map, of, tap } from 'rxjs';
import { FilterMatchMode, FilterService } from 'primeng/api';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { AuthorService } from '../authors-management/service/author.service';
import { BookSearchFields } from './book-search-field';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RoleModulePermission } from 'src/app/models/role-permission.model';
import { ModuleEnum } from 'src/app/enums/module-enum';

@Component({
  selector: 'app-books-management',
  templateUrl: './books-management.component.html',
  styleUrls: ['./books-management.component.css'],
  providers: [DialogService, MessageService],
})
export class BooksManagementComponent implements OnInit {
  books: IBook[] = [];
  booksDisplay: IBook[] = [];
  image: string = '';
  categories: IComboboxOption[] = [];
  allCategories: IComboboxOption[] = [];
  selectedCategory: string = "";

  categorySearchName: string = "All";

  books$?: Observable<IBook[] | null>;

  fields: FormlyFieldConfig[] = [];
  form = new FormGroup({});
  options: FormlyFormOptions = {
    formState: {
      optionList: {
        authors: this.authorService.getAuthorOption(),
        categories: this.bookService.getCategoriesOption()
      }
    }
  };
  
  data: IBookSave = {
    name: '',
    publishYear: '',
  };
  
  //*
  perrmission: RoleModulePermission | undefined;
  bookDetailPermission: RoleModulePermission | undefined;

  constructor(
    private router: Router,
    private sessionService : SessionService,
    private bookService: BookService,
    private confirmDialog: ConfirmDialogService,
    private toastService: ToastService,
    private filterServive: FilterService,
    private authorService: AuthorService,
    public dialogService: DialogService,
    public messageService: MessageService,
  ) {}

  ngOnInit(): void {
    if(
      !this.sessionService.getModulePermission(ModuleEnum.BookList)?.access
      ||
      !this.sessionService.getModulePermission(ModuleEnum.BookManagement)?.access
    )
      this.router.navigate([''])
    else {
      this.getPermission();
      this.loadData();
      this.getCagories();
    }
  }

  responsiveOptions: any[] = [
    {
        breakpoint: '1024px',
        numVisible: 5
    },
    {
        breakpoint: '768px',
        numVisible: 3
    },
    {
        breakpoint: '560px',
        numVisible: 1
    }
  ];

  //*
  getPermission() {
    this.perrmission = this.sessionService.getModulePermission(ModuleEnum.BookList);
    this.bookDetailPermission = this.sessionService.getModulePermission(ModuleEnum.BookChapter);
  }

  loadData() {
    this.books$ = this.bookService.getAll(this.selectedCategory);
    this.fields = BookSearchFields();
  }

  getCagories() {
    this.bookService.getCategoriesOption().subscribe({
      next: (res) => {
        if(res) {
          this.categories = [...this.allCategories] = [{ value: '', label: 'All' }, ...res];
        }
      }
    })
  }

  categoryChange(categoryId: string) {
    if(categoryId === 'all') {
      this.selectedCategory = '';
      this.loadData();
    } else if(categoryId !== this.selectedCategory) {
      this.selectedCategory = categoryId;
      this.loadData();
    }
  }

  categorySearch(text: string) {
    this.categories = [...this.allCategories];
    if(text) {
      this.categorySearchName = text.trim();

      this.categories = this.allCategories.filter(cate => {
        return this.filterServive.filters[FilterMatchMode.CONTAINS](cate.label, this.categorySearchName) ? cate : ''
      });
    }
  }
  
  editItem(item: string) {
    if(this.sessionService.getModulePermission(ModuleEnum.BookList)?.detail)
      this.router.navigate([{ outlets: { modal: ['book', 'edit', item] } }]);
  }

  deleteItem(item: string ) {
    this.confirmDialog.showConfirmDialog(
      'Are you sure you want to delete this item ?',
      'This action cannot be revert'
    ).subscribe({
      next: (confirmed) => {
        if(confirmed) {
          this.bookService.delete(item).subscribe({
            next: (res) => {
              this.toastService.show(MessageType.success, 'This book is deleted successfully')
            },
            error: (err: HttpErrorResponse) => {
              this.toastService.show(MessageType.error, err.error?.detail || 'Delete error')
            }
          })
        }
      }
    })
  }

  search() {
    this.books$ = this.bookService.search(this.data);
  }

  //*
  bookChapter(bookId: string) {
    if(this.bookDetailPermission?.access && bookId)
      this.router.navigate([`/bookchapter/${bookId}`]);
  }
}
