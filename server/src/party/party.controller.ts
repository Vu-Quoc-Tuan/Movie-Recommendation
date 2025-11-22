import { Controller, Post, Body } from '@nestjs/common';
import {PartyService} from "./party.service.js";
import {PartySuggestDto} from "./dto/party-suggest.dto.js";


@Controller('make-server/party-suggest')
export class PartyController {
    constructor(private readonly partyService: PartyService) {}

    @Post()
    async partySuggest(@Body() dto: PartySuggestDto) {
        try {
            return await this.partyService.partySuggest(dto);
        } catch (error: any) {
            console.error('Party suggest error:', error);
            throw error;
        }
    }
}