import { Module } from '@nestjs/common';
import {PartyController} from "./party.controller.js";
import {PartyService} from "./party.service.js";


@Module({
  controllers: [PartyController],
  providers: [PartyService]
})
export class PartyModule {}
