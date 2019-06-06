import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'lodash';

import * as Testing from '@root/test/testbedConfig';

import { RelationshipsComponent } from './relationships.component';
import { DataService } from '@shared/services/data/data.service';
import { RelationResponse } from '@shared/services/api/index.repo';
import { ArchiveSmallComponent } from '@shared/components/archive-small/archive-small.component';
import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';
import { RelationshipService } from '@core/services/relationship/relationship.service';

const defaultRelationData = require('@root/test/responses/relation.getAll.none.success.json');

describe('RelationshipsComponent', () => {
  let component: RelationshipsComponent;
  let fixture: ComponentFixture<RelationshipsComponent>;

  async function init(relationData = defaultRelationData) {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);

    config.declarations.push(RelationshipsComponent);
    config.declarations.push(ArchiveSmallComponent);
    config.declarations.push(BgImageSrcDirective);
    config.providers.push({
      provide: ActivatedRoute,
      useValue: {
        snapshot: {
          data: {
            relations: new RelationResponse(relationData).getRelationVOs()
          }
        }
      }
    });

    await TestBed.configureTestingModule(config).compileComponents();
    fixture = TestBed.createComponent(RelationshipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create with zero relationships', async () => {
    await init();
    expect(component).toBeTruthy();
    expect(component.relations.length).toBe(0);
  });

  it('should create with multiple relationships', async () => {
    const multipleData = require('@root/test/responses/relation.getAll.multiple.success.json');
    await init(multipleData);
    expect(component).toBeTruthy();
    expect(component.relations.length).toBe(2);
  });

});
