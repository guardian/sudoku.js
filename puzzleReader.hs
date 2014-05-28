{-#LANGUAGE OverloadedStrings #-}

import Data.Aeson
import Data.Maybe
import qualified Data.ByteString.Lazy.Char8 as B

data Cell = Cell { col :: Int
                 , row :: Int
                 , value :: Int }

instance ToJSON Cell where
  toJSON (Cell col row value) = object ["col" .= col, "row" .= row, "value" .= value]

fromGrid :: [[Maybe Int]] -> [Cell]
fromGrid rows = [Cell colIndex rowIndex value |
                 (columnsInRow, rowIndex) <- zip rows [0..],
                 (Just value, colIndex) <- zip columnsInRow [0..]]

readValue :: String -> Maybe Int
readValue s = case reads s of 
  (value, "") : [] | value > 0 && value <= 9 -> Just value
  _ -> Nothing

main :: IO ()
main = do
  contents <- getContents
  B.putStrLn $ encode $ fromGrid $ map (map readValue . words) (lines contents)
