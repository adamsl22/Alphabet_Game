class GamesController < ApplicationController
    
    def letters
        render json: Letter.all
    end

    def user
        render json: User.all
    end
end
