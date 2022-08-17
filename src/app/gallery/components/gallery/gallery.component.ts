import { Component, OnInit } from '@angular/core';
import { environment } from '@root/environments/environment';
import { FeaturedArchive } from '../../types/featured-archive';
import { featuredArchives } from '../../data/featured';
import { SecretsService } from '@shared/services/secrets/secrets.service';

@Component({
  selector: 'pr-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  public archives: FeaturedArchive[] = this.getFeaturedArchives();
  public environment: string = environment.environment;
  constructor() {}

  ngOnInit(): void {}

  protected getFeaturedArchives(): FeaturedArchive[] {
    if (
      this.environment !== 'prod' &&
      SecretsService.hasStatic('FEATURED_ARCHIVES')
    ) {
      const envFeatured = SecretsService.getStatic('FEATURED_ARCHIVES');
      if (envFeatured) {
        const archives = JSON.parse(envFeatured) as FeaturedArchive[];
        if (archives) {
          return archives;
        }
      }
    }
    return featuredArchives;
  }
}
