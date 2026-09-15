import { Controller, Get, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('featured')
  async getFeatured() {
    return this.catalogService.getFeatured();
  }

  @Get('genres')
  async getGenres() {
    return this.catalogService.getGenres();
  }

  @Get('artists')
  async getArtists() {
    return this.catalogService.getArtists();
  }

  @Get('artists/:id')
  async getArtist(@Param('id') id: string) {
    return this.catalogService.getArtistById(id);
  }

  @Get('albums')
  async getAlbums() {
    return this.catalogService.getAlbums();
  }

  @Get('albums/:id')
  async getAlbum(@Param('id') id: string) {
    return this.catalogService.getAlbumById(id);
  }
}
