import { Injectable } from '@nestjs/common';
import { PartySuggestDto } from './dto/party-suggest.dto.js';


@Injectable()
export class PartyService {
    async partySuggest(dto: PartySuggestDto) {
        const { members } = dto;

        // This would normally analyze moods and call an LLM
        // For now, return mock data
        const suggestions = [
            { title: 'The Grand Budapest Hotel', match: 92 },
            { title: 'Parasite', match: 88 },
        ];

        console.log('Party suggestions generated:', { memberCount: members.length });

        return suggestions;
    }
}