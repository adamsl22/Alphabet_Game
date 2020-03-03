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
        Lg.delete_all
        render json: Game.create(game_params)
    end

    def updateGame
        game = Game.find(params[:id])
        render json: game.update(update_params)
    end

    def lgs
        render json: Lg.all
    end

    def newLg
        render json: Lg.create(lg_params)
    end

    private

    def user_params
        params.permit(:name)
    end
    def game_params
        params.permit(:user_id)
    end
    def update_params
        params.permit(:seconds, :result, :difficulty)
    end
    def lg_params
        params.permit(:game_id, :letter_id)
    end
end
