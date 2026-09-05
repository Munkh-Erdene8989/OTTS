import { Controller, Get, Param, Query } from "@nestjs/common";
import { CatalogService } from "./catalog.service";
import { Public } from "../common/decorators";

@Public()
@Controller("v1")
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get("catalog/home")
  home() {
    return this.catalog.home();
  }

  @Get("catalog/new")
  newest() {
    return this.catalog.newest();
  }

  @Get("catalog/reels")
  reels() {
    return this.catalog.reels();
  }

  @Get("catalog/search")
  search(@Query("q") q = "") {
    if (!q.trim()) return [];
    return this.catalog.search(q.trim());
  }

  @Get("titles/:id")
  byId(@Param("id") id: string) {
    return this.catalog.byId(id);
  }

  @Get("titles/:id/similar")
  similar(@Param("id") id: string) {
    return this.catalog.similar(id);
  }
}
