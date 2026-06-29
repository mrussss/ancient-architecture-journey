cmake_minimum_required(VERSION 3.22)

project(MarioLikePlatformer VERSION 0.1.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

option(MARIO_FETCH_SDL2 "Fetch and build SDL2 when no system SDL2 package is found" ON)
option(MARIO_FETCH_SDL2_IMAGE "Fetch and build SDL_image when no system SDL_image package is found" ON)

include(FetchContent)

set(MARIO_SOURCES
    src/main.cpp
    src/Game.cpp
    src/Player.cpp
    src/Entity.cpp
    src/Level.cpp
    src/LevelData.cpp
    src/Enemy.cpp
    src/Trap.cpp
    src/Collectible.cpp
    src/UI.cpp
    src/Collision.cpp
    src/TextureManager.cpp
)

find_package(SDL2 CONFIG QUIET)
if(NOT SDL2_FOUND)
    find_package(SDL2 QUIET)
endif()

if(NOT TARGET SDL2::SDL2 AND
   NOT TARGET SDL2::SDL2-static AND
   NOT TARGET SDL2 AND
   NOT TARGET SDL2-static AND
   MARIO_FETCH_SDL2)
    include(FetchContent)
    include(CheckIncludeFile)

    check_include_file("X11/Xlib.h" MARIO_HAS_X11)
    check_include_file("wayland-client.h" MARIO_HAS_WAYLAND)

    set(SDL_SHARED OFF CACHE BOOL "" FORCE)
    set(SDL_STATIC ON CACHE BOOL "" FORCE)
    set(SDL_TEST OFF CACHE BOOL "" FORCE)
    set(SDL_TESTS OFF CACHE BOOL "" FORCE)
    set(SDL_INSTALL OFF CACHE BOOL "" FORCE)
    set(SDL_AUDIO OFF CACHE BOOL "" FORCE)

    if(UNIX AND NOT APPLE)
        if(NOT MARIO_HAS_X11)
            set(SDL_X11 OFF CACHE BOOL "" FORCE)
        endif()
        if(NOT MARIO_HAS_WAYLAND)
            set(SDL_WAYLAND OFF CACHE BOOL "" FORCE)
        endif()
        set(SDL_ALSA OFF CACHE BOOL "" FORCE)
        set(SDL_DBUS OFF CACHE BOOL "" FORCE)
        set(SDL_IBUS OFF CACHE BOOL "" FORCE)
        set(SDL_JACK OFF CACHE BOOL "" FORCE)
        set(SDL_KMSDRM OFF CACHE BOOL "" FORCE)
        set(SDL_PIPEWIRE OFF CACHE BOOL "" FORCE)
        set(SDL_PULSEAUDIO OFF CACHE BOOL "" FORCE)
        set(SDL_SNDIO OFF CACHE BOOL "" FORCE)
    endif()

    FetchContent_Declare(
        SDL2
        GIT_REPOSITORY https://github.com/libsdl-org/SDL.git
        GIT_TAG release-2.30.12
        GIT_SHALLOW TRUE
    )
    FetchContent_MakeAvailable(SDL2)
endif()

find_package(SDL2_image CONFIG QUIET)
if(NOT SDL2_image_FOUND)
    find_package(SDL2_image QUIET)
endif()

if(NOT TARGET SDL2_image::SDL2_image AND
   NOT TARGET SDL2_image::SDL2_image-static AND
   NOT TARGET SDL2_image AND
   NOT TARGET SDL2_image-static AND
   MARIO_FETCH_SDL2_IMAGE)
    set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_INSTALL OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_SAMPLES OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_TESTS OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_VENDORED ON CACHE BOOL "" FORCE)
    set(SDL2IMAGE_DEPS_SHARED OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_BACKEND_STB OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_AVIF OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_BMP OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_GIF OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_JPG OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_JXL OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_LBM OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_PCX OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_PNG ON CACHE BOOL "" FORCE)
    set(SDL2IMAGE_PNM OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_QOI OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_SVG OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_TGA OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_TIF OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_WEBP OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_XCF OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_XPM OFF CACHE BOOL "" FORCE)
    set(SDL2IMAGE_XV OFF CACHE BOOL "" FORCE)
    set(PNG_SHARED OFF CACHE BOOL "" FORCE)
    set(PNG_STATIC ON CACHE BOOL "" FORCE)
    set(PNG_EXECUTABLES OFF CACHE BOOL "" FORCE)
    set(PNG_TESTS OFF CACHE BOOL "" FORCE)
    set(SKIP_INSTALL_ALL ON CACHE BOOL "" FORCE)

    FetchContent_Declare(
        SDL2_image
        GIT_REPOSITORY https://github.com/libsdl-org/SDL_image.git
        GIT_TAG release-2.8.2
        GIT_SHALLOW TRUE
    )
    FetchContent_MakeAvailable(SDL2_image)

    if(TARGET SDL2_image AND EXISTS "${sdl2_image_BINARY_DIR}/external/libpng")
        target_include_directories(SDL2_image PRIVATE "${sdl2_image_BINARY_DIR}/external/libpng")
    endif()
endif()

add_executable(mario_like ${MARIO_SOURCES})
target_include_directories(mario_like PRIVATE src)
target_compile_definitions(mario_like PRIVATE ASSET_DIR="${CMAKE_CURRENT_SOURCE_DIR}/assets")

foreach(SDL_MAIN_TARGET SDL2::SDL2main SDL2main)
    if(TARGET ${SDL_MAIN_TARGET})
        target_link_libraries(mario_like PRIVATE ${SDL_MAIN_TARGET})
    endif()
endforeach()

set(MARIO_SDL_LINKED OFF)
foreach(SDL_TARGET SDL2::SDL2-static SDL2::SDL2 SDL2-static SDL2)
    if(TARGET ${SDL_TARGET})
        target_link_libraries(mario_like PRIVATE ${SDL_TARGET})
        set(MARIO_SDL_LINKED ON)
        break()
    endif()
endforeach()

if(NOT MARIO_SDL_LINKED)
    if(SDL2_INCLUDE_DIRS)
        target_include_directories(mario_like PRIVATE ${SDL2_INCLUDE_DIRS})
    endif()
    if(SDL2_LIBRARIES)
        target_link_libraries(mario_like PRIVATE ${SDL2_LIBRARIES})
        set(MARIO_SDL_LINKED ON)
    endif()
endif()

if(NOT MARIO_SDL_LINKED)
    message(FATAL_ERROR "SDL2 was not found and could not be fetched. Install libsdl2-dev or enable network access.")
endif()

set(MARIO_SDL_IMAGE_LINKED OFF)
foreach(SDL_IMAGE_TARGET SDL2_image::SDL2_image-static SDL2_image::SDL2_image SDL2_image-static SDL2_image)
    if(TARGET ${SDL_IMAGE_TARGET})
        target_link_libraries(mario_like PRIVATE ${SDL_IMAGE_TARGET})
        set(MARIO_SDL_IMAGE_LINKED ON)
        break()
    endif()
endforeach()

if(NOT MARIO_SDL_IMAGE_LINKED)
    if(SDL2_IMAGE_INCLUDE_DIRS)
        target_include_directories(mario_like PRIVATE ${SDL2_IMAGE_INCLUDE_DIRS})
    endif()
    if(SDL2_IMAGE_LIBRARIES)
        target_link_libraries(mario_like PRIVATE ${SDL2_IMAGE_LIBRARIES})
        set(MARIO_SDL_IMAGE_LINKED ON)
    endif()
endif()

if(NOT MARIO_SDL_IMAGE_LINKED)
    message(FATAL_ERROR "SDL_image was not found and could not be fetched. Install libsdl2-image-dev or enable network access.")
endif()

if(MSVC)
    target_compile_options(mario_like PRIVATE /W4 /permissive-)
else()
    target_compile_options(mario_like PRIVATE -Wall -Wextra -Wpedantic)
endif()
