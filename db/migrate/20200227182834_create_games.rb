class CreateGames < ActiveRecord::Migration[6.0]
  def change
    create_table :games do |t|
      t.integer :seconds, default: 0
      t.boolean :result, default: false
      t.integer :user_id

      t.timestamps
    end
  end
end
