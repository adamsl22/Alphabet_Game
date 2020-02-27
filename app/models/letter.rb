class Letter < ApplicationRecord
    has_many :lgs
    has_many :games, through: :lgs
end
