class Game < ApplicationRecord
    belongs_to :user
    has_many :lgs
    has_many :letters, through: :lgs
end
