{-# LANGUAGE OverloadedStrings #-}
module Main (main) where

import Data.Text (Text)
import qualified Data.Text as T
import Nagare.Dsl.Access (requireLogin)
import Nagare.Dsl.Build (BuildSpec (PrebuiltImage), mkTag)
import Nagare.Dsl.Config (emitDeployment)
import Nagare.Dsl.Presets (webService)
import Nagare.Dsl.Types
import System.Environment (getEnv)

deployment :: Text -> Either Text Deployment
deployment releaseTag = do
  dep <- webService "keiro-docs" "keiro-docs"
  tag <- mkTag releaseTag
  hosts <- mkDomains [("keiro-docs.labs.topagentnetwork.net", True)]
  health <- httpHealthCheck "/healthz"
  scaling <- mkScale 1 3
  pure dep
    { build = PrebuiltImage tag
    , domains = hosts
    , access = Just requireLogin
    , healthCheck = Just health
    , scale = Just scaling
    }

main :: IO ()
main = do
  releaseTag <- T.pack <$> getEnv "KEIRO_DOCS_IMAGE_TAG"
  case deployment releaseTag of
    Left err -> ioError (userError (T.unpack err))
    Right dep -> emitDeployment dep
