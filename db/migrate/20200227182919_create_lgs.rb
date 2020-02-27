class CreateLgs < ActiveRecord::Migration[6.0]
  def change
    create_table :lgs do |t|
      t.integer :game_id
      t.integer :letter_id

      t.timestamps
    end
  end
end
