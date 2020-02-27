class GamesController < ApplicationController
    
    
    
    def letters
        render json: Letter.all
    end
end
