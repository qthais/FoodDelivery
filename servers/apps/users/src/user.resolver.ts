import { BadRequestException, UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UsersService } from "./users.service";
import { ActivationResponse, LoginResponse, LogoutResonse, RegisterResponse} from "./types/user.types";
import { ActivationDto, RegisterDto } from "./dto/user.dto";
import { User } from "./entities/user.entity";
import { Response } from "express";
import { AuthGuard } from "./guards/auth.guard";
@Resolver()
export class UserResolver{
    constructor(
        private readonly userService:UsersService
    ){}
    @Mutation(()=>RegisterResponse)
    async register(
        @Args('registerDto') registerDto:RegisterDto,
        @Context() context:{res:Response}
    ):Promise<RegisterResponse>{
        if(!registerDto.name||!registerDto.email||!registerDto.password){
            throw new BadRequestException('Please fill in all fields')
        }
        const {activationToken}= await this.userService.register(registerDto,context.res)
        return {activationToken}
    }
    @Mutation(()=>ActivationResponse)
    async activateUser(
        @Args('ActivationDto') activationDto:ActivationDto,
        @Context() context:{res:Response}
    ):Promise<ActivationResponse>{
        return await this.userService.activateUser(activationDto,context.res)
    }
    @Mutation(()=>LoginResponse)
    async Login(
        @Args('email') email:string,
        @Args('password') password:string
    ):Promise<LoginResponse>{
        return await this.userService.Login({email,password})
    }
    @Query(()=>LoginResponse)
    @UseGuards(AuthGuard)
    async getLoggedInUser(@Context() context:{req:Request}){
        return await this.userService.getLoggedInUser(context.req)
    }
    @Query(()=>LogoutResonse)
    @UseGuards(AuthGuard)
    async logOUtUser(@Context() context:{req:Request}){
        return await this.userService.Logout(context.req)
    }

    @Query(()=>[User])
    async getUsers(){
        return this.userService.getUsers()
    }
}