Command to restore data:

tar xzvf restorable.tar.gz

arangorestore --create-database true --include-system-collections true --input-directory restorable --server.database dependencyGraph
