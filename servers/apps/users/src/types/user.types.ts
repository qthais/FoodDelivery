import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";

@ObjectType()
export class ErrorType{
    @Field()
    message:string;
    
    @Field({nullable:true})
    code?:string;
}

@ObjectType()
export class RegisterResponse{
    @Field()
    activationToken:string

    @Field(()=>ErrorType,{nullable:true})
    error?:ErrorType    
}
@ObjectType()
export class LoginResponse{
    @Field(()=>User,{nullable:true})
    user?:User|any
    @Field({nullable:true})
    accessToken:string
    @Field({nullable:true})
    refreshToken:string
    @Field(()=>ErrorType,{nullable:true})
    error?:ErrorType    
}
@ObjectType()
export class ActivationResponse{
    @Field(()=>User)
    user?:User|any

    @Field(()=>ErrorType,{nullable:true})
    error?:ErrorType    
}
@ObjectType()
export class LogoutResonse{
    @Field()
    message:string
}