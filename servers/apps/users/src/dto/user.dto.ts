import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty,IsString, MinLength } from "class-validator";

@InputType()
export class RegisterDto{
    @Field()
    @IsNotEmpty({message:"Name is required."})
    @IsString({message:"Name must be a string."})
    name:string;
    @Field()
    @IsNotEmpty({message:"Password is required."})
    @MinLength(8,{message:"Password must be at least 8 characters"})
    password:string;
    @Field()
    @IsNotEmpty({message:"Email is required."})
    @IsEmail({},{message:"Invalid email!."})
    email:string;
    @Field()
    @IsNotEmpty({message:"Phone number is required."})
    @IsEmail({},{message:"Invalid phone number!."})
    phone_number:string;
}

@InputType()
export class ActivationDto{
    @Field()
    @IsNotEmpty({message:"Activation Token is required"})
    activationToken:string
    @Field()
    @IsNotEmpty({message:"Password is required!"})
    activationCode:string
}

@InputType()
export class LoginDto{
    @Field()
    @IsNotEmpty({message:"Email is required."})
    @IsEmail({},{message:"Invalid email!."})
    email:string;
    @Field()
    @IsNotEmpty({message:"Password is required."})
    @MinLength(8,{message:"Password must be at least 8 characters"})
    password:string;
}
