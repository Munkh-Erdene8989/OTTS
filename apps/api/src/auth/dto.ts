import { IsString, Matches, Length } from "class-validator";

export class RequestOtpDto {
  @IsString()
  @Matches(/^(\+?976)?\d{8}$/, { message: "Утасны дугаар буруу байна" })
  phone!: string;
}

export class VerifyOtpDto {
  @IsString()
  @Matches(/^(\+?976)?\d{8}$/, { message: "Утасны дугаар буруу байна" })
  phone!: string;

  @IsString()
  @Length(4, 8)
  code!: string;
}
