package com.analyzer.analyzer.user.mapper;

import com.analyzer.analyzer.user.User;
import com.analyzer.analyzer.user.dtos.UserDto;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    UserDto UserToUserDto(User customUser);
}
