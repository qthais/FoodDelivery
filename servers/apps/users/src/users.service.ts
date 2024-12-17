import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ActivationDto, LoginDto, RegisterDto } from './dto/user.dto';
import { PrismaService } from '../../../prisma/Prisma.service';
import { response, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { EmailService } from './email/email.service';
import { TokenSender } from './utils/sendToken';
interface UserData {
  name: string;
  email: string;
  password: string;
  phone_number: string;
}
@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService:EmailService
  ) {}
  async register(registerDto: RegisterDto, response: Response) {
    const { name, email, password, phone_number } = registerDto;
    const isEmailExist = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    const isPhoneNumberExist = await this.prisma.user.findUnique({
      where: {
        phone_number,
      },
    });
    if (isPhoneNumberExist) {
      throw new BadRequestException('Phone number has already existed!');
    }
    if (isEmailExist) {
      throw new BadRequestException('Email has already existed!');
    }
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    const user = {
      name,
      email,
      password: hashedPassword,
      phone_number,
    };
    const activationObject= await this.createActivationToken(user)
    const activationCode= activationObject.activationCode
    await this.emailService.sendEmail({
      email,
      subject:'Activate your account!',
      template:'./activation-mail',
      name,
      activationCode,
    })
    console.log('Email sent to:', email);
    return { activationToken:activationObject.token, response };
  }
  async createActivationToken(user: UserData) {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = this.jwtService.sign(
      {
        user,
        activationCode,
      },
      {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
        expiresIn: '5m',
      },
    );
    return { token, activationCode };
  }
  async activateUser(activationDto:ActivationDto,response:Response){
    const {activationCode,activationToken}=activationDto
    const newUser:{user:UserData,activationCode:string}=this.jwtService.verify(
      activationToken,
      {secret:this.configService.get<string>('ACTIVATION_SECRET')}
    )
    if(newUser.activationCode!== activationCode){
      throw new BadRequestException("Invalid activation code")
    }
    const {name,email,password,phone_number}=newUser.user
    const existUser= await this.prisma.user.findUnique({
      where:{
        email
      }
    })
    if(existUser){
      throw new BadRequestException("User already exist with this email")
    }
    const user=await this.prisma.user.create({
      data:{
        name,
        email,
        password,
        phone_number
      }
    })
    return {user,response}
  }
  async Login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user= await this.prisma.user.findUnique({
      where:{
        email
      }
    })
    if(user&& (await this.comparePassword(password,user.password))){
      const tokenSender= new TokenSender(this.configService,this.jwtService)
      return tokenSender.sendToken(user)
    }else{
      return {
        user:null,
        accessToken:null,
        refreshToken:null,
        error:{
          message:"Incorrect email or password!"
        }
      }
    }

  }
  async comparePassword(password:string,hashedPassword:string){
    return await bcrypt.compare(password,hashedPassword)
  }
  async getLoggedInUser(req:any){
    const user=req.user
    const refreshToken= req.refreshtoken;
    const accessToken=req.accesstoken
    return ({user,refreshToken,accessToken})
  }
  async Logout(req:any){
    req.user=null;
    req.refreshtoken=null;
    req.accesstoken=null;
    return {message:"Logged out successfully"}
  }
  async getUsers() {
    return this.prisma.user.findMany();
  }
}
