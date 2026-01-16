import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto } from './dto';
import { JwtAuthGuard, AdminGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: '회원 통계 조회 (관리자)' })
  @ApiResponse({ status: 200, description: '회원 통계' })
  async getStats() {
    return this.usersService.getStats();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '프로필 조회' })
  @ApiResponse({ status: 200, description: '프로필 정보 반환' })
  async getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '프로필 수정' })
  @ApiResponse({ status: 200, description: '프로필 수정 성공' })
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(user.id, updateUserDto);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({ status: 200, description: '비밀번호 변경 성공' })
  @ApiResponse({ status: 400, description: '소셜 로그인 계정' })
  @ApiResponse({ status: 401, description: '현재 비밀번호 불일치' })
  async changePassword(
    @CurrentUser() user: { id: string },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.id, changePasswordDto);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ status: 200, description: '회원 탈퇴 성공' })
  async deleteAccount(@CurrentUser() user: { id: string }) {
    return this.usersService.deleteAccount(user.id);
  }
}
