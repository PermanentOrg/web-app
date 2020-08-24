import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from '@shared/services/message/message.service';
import { UploadService } from '@core/services/upload/upload.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { DataService } from '@shared/services/data/data.service';
import { EditService } from '@core/services/edit/edit.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { TooltipsPipe } from '@shared/pipes/tooltips.pipe';
import { ApiService } from '@shared/services/api/api.service';
import { HttpService } from '@shared/services/http/http.service';
import { ProfileService } from '@shared/services/profile/profile.service';
import { RouteHistoryService } from 'ngx-route-history';

export const BASE_TEST_CONFIG = {
  imports: [
    HttpClientTestingModule,
    RouterTestingModule,
    FormsModule,
    ReactiveFormsModule
  ] as any[],
  providers: [
    CookieService,
    MessageService,
    UploadService,
    PromptService,
    HttpService,
    ApiService,
    DataService,
    FolderViewService,
    FolderPickerService,
    PrConstantsService,
    ProfileService,
    EditService,
    RouteHistoryService
  ] as any[],
  declarations: [
    TooltipsPipe
  ] as any[]
};
