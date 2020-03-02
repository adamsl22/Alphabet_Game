# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Letter.destroy_all

Letter.create(character: "A")
Letter.create(character: "B")
Letter.create(character: "C")
Letter.create(character: "D")
Letter.create(character: "E")
Letter.create(character: "F")
Letter.create(character: "G")
Letter.create(character: "H")
Letter.create(character: "I")
Letter.create(character: "J")
Letter.create(character: "K")
Letter.create(character: "L")
Letter.create(character: "M")
Letter.create(character: "N")
Letter.create(character: "O")
Letter.create(character: "P")
Letter.create(character: "Q")
Letter.create(character: "R")
Letter.create(character: "S")
Letter.create(character: "T")
Letter.create(character: "U")
Letter.create(character: "V")
Letter.create(character: "W")
Letter.create(character: "X")
Letter.create(character: "Y")
Letter.create(character: "Z")

Game.destroy_all
User.destroy_all

u1 = User.create(name: "Martin")
Game.create({seconds: 10, result: true, user_id: u1.id})
Game.create({seconds: 5, result: true, user_id: u1.id})
User.create(name: 'Test')
Game.create(seconds: 999, result: true, user_id: 1)
