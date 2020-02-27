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

    private

    def user_params
        params.permit(:name)
    end
end
