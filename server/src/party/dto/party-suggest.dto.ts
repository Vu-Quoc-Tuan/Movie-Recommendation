export class PartyMember {
    name: string;
    mood?: string;
}

export class PartySuggestDto {
    members: PartyMember[];
}