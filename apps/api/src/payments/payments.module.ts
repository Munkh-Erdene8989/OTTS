import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { AuthModule } from "../auth/auth.module";
import { AccessModule } from "../access/access.module";

@Module({
  imports: [AuthModule, AccessModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
