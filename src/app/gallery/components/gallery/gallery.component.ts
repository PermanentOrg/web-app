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
  public environment: string = '';
  public archives: FeaturedArchive[] = this.getFeaturedArchives();
  constructor() {}

  ngOnInit(): void {}

  protected getFeaturedArchives(): FeaturedArchive[] {
    this.environment = environment.environment;
    if (
      this.environment !== 'prod' &&
      SecretsService.hasStatic('FEATURED_ARCHIVES')
    ) {
      const envFeatured = SecretsService.getStatic('FEATURED_ARCHIVES');
      console.log('envFeatured', envFeatured)
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
