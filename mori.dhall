let Schema =
      https://raw.githubusercontent.com/shinzui/mori-schema/026ae74331e5c516542af1dd96f041c658ed4621/package.dhall
        sha256:18258ef583580a897f4af3e7c86db0342afb42fb40efc535b217ba1089230141

in  Schema.Project::{
    , project = Schema.ProjectIdentity::{
      , name = "keiro-runtime-docs"
      , namespace = "shinzui"
      , type = Schema.PackageType.Other "Documentation"
      , language = Schema.Language.Haskell
      , lifecycle = Schema.Lifecycle.Active
      , description = Some
          "Fumadocs site documenting the keiro runtime — five Haskell libraries (kiroku, keiro, keiki, shibuya, pgmq) plus their integrations and a worked example app"
      , domains = [ "EventSourcing", "Workflow" ]
      }
    , repos =
      [ Schema.Repo::{
        , name = "keiro-runtime-docs"
        , github = Some "shinzui/keiro-runtime-docs"
        }
      ]
    , dependencies =
      [ "shinzui/keiki"
      , "shinzui/keiro"
      , "shinzui/kiroku"
      , "shinzui/shibuya"
      , "shinzui/shibuya-pgmq-adapter"
      , "shinzui/pgmq-hs"
      ]
    , docs =
      [ Schema.DocRef::{
        , key = "overview"
        , kind = Schema.DocKind.Guide
        , audience = Schema.DocAudience.Module
        , description = Some
            "Landing page introducing the keiro runtime family; start here"
        , location = Schema.DocLocation.LocalFile "content/docs/index.mdx"
        }
      , Schema.DocRef::{
        , key = "getting-started"
        , kind = Schema.DocKind.Guide
        , audience = Schema.DocAudience.Module
        , description = Some "Onboarding path for the keiro runtime"
        , location = Schema.DocLocation.LocalDir "content/docs/getting-started"
        }
      , Schema.DocRef::{
        , key = "kiroku"
        , kind = Schema.DocKind.Guide
        , audience = Schema.DocAudience.Module
        , description = Some
            "記録 — append-only PostgreSQL event store, the persistence foundation"
        , location = Schema.DocLocation.LocalDir "content/docs/kiroku"
        }
      , Schema.DocRef::{
        , key = "keiro"
        , kind = Schema.DocKind.Guide
        , audience = Schema.DocAudience.Module
        , description = Some "経路 — event-sourcing framework and workflow engine"
        , location = Schema.DocLocation.LocalDir "content/docs/keiro"
        }
      , Schema.DocRef::{
        , key = "keiki"
        , kind = Schema.DocKind.Guide
        , audience = Schema.DocAudience.Module
        , description = Some "継起 — pure, dependency-free mathematical core"
        , location = Schema.DocLocation.LocalDir "content/docs/keiki"
        }
      , Schema.DocRef::{
        , key = "shibuya"
        , kind = Schema.DocKind.Guide
        , audience = Schema.DocAudience.Module
        , description = Some
            "Worker/runtime layer that leases from the queue substrate"
        , location = Schema.DocLocation.LocalDir "content/docs/shibuya"
        }
      , Schema.DocRef::{
        , key = "pgmq"
        , kind = Schema.DocKind.Guide
        , audience = Schema.DocAudience.Module
        , description = Some
            "PostgreSQL message queue — the queue substrate for shibuya's workers"
        , location = Schema.DocLocation.LocalDir "content/docs/pgmq"
        }
      , Schema.DocRef::{
        , key = "integrations"
        , kind = Schema.DocKind.Guide
        , audience = Schema.DocAudience.Module
        , description = Some
            "How the libraries wire together (keiro+kiroku, keiro+pgmq, keiro+keiki, shibuya adapters)"
        , location = Schema.DocLocation.LocalDir "content/docs/integrations"
        }
      , Schema.DocRef::{
        , key = "example-app"
        , kind = Schema.DocKind.Guide
        , audience = Schema.DocAudience.Module
        , description = Some
            "End-to-end worked example wiring the runtime together (keiro-runtime-jitsurei)"
        , location = Schema.DocLocation.LocalDir "content/docs/example-app"
        }
      ]
    }
