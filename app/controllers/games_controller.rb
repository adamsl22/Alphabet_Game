class GamesController < ApplicationController
    
    def letters
        render json: Letter.all
    end

    def users
        render json: User.all
    end

    def newUser
        render json: User.create(user_params)
    end

    def games
        render json: Game.all
    end

    def newGame
        render json: Game.create(game_params)
    end


    private

    def user_params
        params.permit(:name)
    end
    def game_params
        params.permit(:user_id)
    end
end
