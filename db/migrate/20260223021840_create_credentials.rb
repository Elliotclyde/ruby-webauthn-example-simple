class CreateCredentials < ActiveRecord::Migration[8.1]
  def change
    create_table :credentials do |t|
      t.references :user, null: false, foreign_key: true
      t.string :external_id
      t.string :nickname
      t.string :public_key
      t.integer :sign_count

      t.timestamps
    end

    add_index :credentials, :external_id, unique: true
  end
end
