export class PartyMoodMember {
    id: string;
    name: string;
    mood?: string;
    moodText?: string;
}

export class AnalyzePartyMoodDto {
    members: PartyMoodMember[];
}