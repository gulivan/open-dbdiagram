
# dbdiagram-oss

An Open Source alternative to dbdiagram.io, aiming to have the same basic features+more. Motivation behind the project was that $9/month overpriced subscription for just some **very VERY** basic features. (dark mode/header colours/table groups)

## Forked Info

+ 1. Crappy auto-layout algorithm
+ 2. Remote S3 repository
+ 3. Repaired bug correct redrawing after changing the file
+ 4. Repaired bug droping "text" field in localStorage when selecting another clean file
+ 5. Docker image:  docker pull nomadshub/dbdiagrams-oss-wrep:2.2

### Sep.23 update
+ 6. Notifications for repository actions
+ 7. Added relation labels (1 or *) (minor positioning issues)
+ 7. Custom header colors (done)
+ 8. Export to SVG, PNG, Json
+ 9. Several new bugs (decision is in progress)
+ 10. Next cool update for header and relation labels will be later...

## Architecture - Solution

![Arch](https://raw.githubusercontent.com/NomadRazor/dbdiagram-oss-wrep/master/.github/media/arch.png)

## Repository settings demo

![Repo Demo Link](https://raw.githubusercontent.com/NomadRazor/dbdiagram-oss-wrep/master/.github/media/repo_demo.mov)
https://raw.githubusercontent.com/NomadRazor/dbdiagram-oss-wrep/master/.github/media/repo_demo.mov

## Live Demo

Fork demo [nomadrazor.github.io/dbdiagram-oss-wrep](https://nomadrazor.github.io/dbdiagram-oss-wrep/)

View the latest master branch at [trudan.github.io/dbdiagram-oss](https://trudan.github.io/dbdiagram-oss/)




## License

[MIT](https://choosealicense.com/licenses/mit/)


## Screenshots

![Demo GIF](https://raw.githubusercontent.com/TruDan/dbdiagram-oss/master/.github/media/demo.gif)


## Related

[quasar](https://quasar.dev/) - Awesome VueJS framework

[jointjs](https://github.com/clientIO/joint) - Charting Library used for diagrams

[dbml.org](https://www.dbml.org/home/) - DBML Parser/importer/exporter

[dbdiagram.io](https://dbdiagram.io/home) - Original DBDiagram tool

[dbdocs.io](https://dbdocs.io/) - Documentation generator for DBML


