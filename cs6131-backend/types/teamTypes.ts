// @ts-nocheck
import {IsOptional, IsUrl, Length, Matches, ValidateIf} from "class-validator";

export class RegisteringTeam {
    @Length(3, 32)
    @Matches(/^[A-Za-z0-9_\s]*$/)
    name: string;
    @Length(0, 32)
    @IsOptional()
    description?: string;
    @ValidateIf(t => t.pfp !== '')
    @IsUrl()
    @IsOptional()
    pfp?: string;
    public: boolean;
}

export class Team extends RegisteringTeam {
    @Length(6, 32)
    @Matches(/^[A-Za-z0-9_]*$/)
    owner: string;
}