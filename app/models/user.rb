class User < ApplicationRecord
    has_many :games

    validates :name, presence: {message: "error: You must create a username."}
    validates :name, uniqueness: {message: "error: This username is already in use."}
end
