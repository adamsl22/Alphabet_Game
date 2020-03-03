class AddDifficultyToGames < ActiveRecord::Migration[6.0]
  def change
    add_column :games, :difficulty, :string, :default => 'Easy'
  end
end
