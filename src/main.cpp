#include "Game.h"

#include <string>

int main(int argc, char* argv[]) {
    Game game;
    if (!game.init()) {
        return 1;
    }

    if (argc > 1 && std::string(argv[1]) == "--smoke-test") {
        game.runOneFrame(1.0f / 60.0f);
        return 0;
    }

    game.run();
    return 0;
}
