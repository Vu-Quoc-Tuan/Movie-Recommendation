import { Controller, Get, Query, Request, UseGuards, Optional } from '@nestjs/common';
import {MovieService} from "./movie.service.js";
import {FetchMoviesDto} from "./dto/fetch-movies.dto.js";
import {JwtService} from "../common/jwt/jwt.service.js";


@Controller('make-server/movies')
export class MovieController {
  constructor(private readonly movieService: MovieService,
              private readonly jwtService: JwtService) {}

  @Get()
  async fetchMovies(@Query() fetchMoviesDto: FetchMoviesDto) {
    try {
      const movies = await this.movieService.fetchMovies(fetchMoviesDto);
      return movies;
    } catch (error: any) {
      console.error('Fetch movies error:', error);
      throw error;
    }
  }


}