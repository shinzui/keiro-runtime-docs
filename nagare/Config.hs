{-# LANGUAGE OverloadedStrings #-}
module Main (main) where

import qualified Data.Map.Strict as Map
import Data.Maybe (catMaybes)
import Data.Text (Text)
import qualified Data.Text as T
import Nagare.Dsl.Access (requireLogin)
import Nagare.Dsl.Build (BuildSpec (PrebuiltImage), mkTag)
import Nagare.Dsl.Config (emitDeployment)
import Nagare.Dsl.Presets (webService)
import Nagare.Dsl.Types
import System.Environment (getEnv, lookupEnv)

deployment :: Text -> [(Text, Text)] -> Either Text Deployment
deployment releaseTag variables = do
  dep <- webService "keiro-docs" "keiro-docs"
  tag <- mkTag releaseTag
  hosts <- mkDomains [("keiro-docs.labs.topagentnetwork.net", True)]
  health <- httpHealthCheck "/healthz"
  scaling <- mkScale 1 3
  runtimeEnv <- traverse (\(name, value) -> do
    key <- mkEnvName name
    pure (key, runtimeScoped (EnvLiteral value))) variables
  pure dep
    { build = PrebuiltImage tag
    , domains = hosts
    , access = Just requireLogin
    , healthCheck = Just health
    , scale = Just scaling
    , env = Map.fromList runtimeEnv
    }

main :: IO ()
main = do
  releaseTag <- T.pack <$> getEnv "KEIRO_DOCS_IMAGE_TAG"
  variables <- fmap catMaybes $ traverse (\name -> do
    value <- lookupEnv name
    pure ((\v -> (T.pack name, T.pack v)) <$> value))
    ["KEIRO_DOCS_ANALYTICS_CONFIG", "KEIRO_DOCS_TRUST_FORWARDED_USER"]
  case deployment releaseTag variables of
    Left err -> ioError (userError (T.unpack err))
    Right dep -> emitDeployment dep
