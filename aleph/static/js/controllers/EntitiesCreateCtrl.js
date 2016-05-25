aleph.controller('EntitiesCreateCtrl', ['$scope', '$http', '$uibModalInstance', 'Session', 'Authz', 'Collection', 'Alert', 'Validation', 'entity', 'metadata',
    function($scope, $http, $uibModalInstance, Session, Authz, Collection, Alert, Validation, entity, metadata) {

  $scope.blocked = false;
  $scope.availableSchemata = ['/entity/person.json#', '/entity/company.json#',
                              '/entity/organization.json#'];
  $scope.selectSchema = !entity.$schema;
  $scope.entity = entity;
  $scope.entity.jurisdiction_code = $scope.entity.jurisdiction_code || null;
  $scope.entity.$schema = $scope.entity.$schema || $scope.availableSchemata[0];
  $scope.createAlert = true;
  $scope.collection = {};
  $scope.createCollection = false;
  $scope.collections = [];
  $scope.schemata = metadata.schemata;

  Collection.getWriteable().then(function(collections) {
    $scope.collections = collections;
    if (!$scope.hasCollections()) {
      $scope.setCreateCollection(true);
    }
  });

  $scope.setSchema = function(schema) {
    $scope.entity.$schema = schema;
  };

  $scope.hasCollections = function() {
    return $scope.collections.length > 0;
  };

  $scope.setCreateCollection = function(flag) {
    Session.get().then(function(session) {
      $scope.createCollection = flag;
      if (flag) {
        $scope.collection = {
          label: session.role.name + '\'s Watchlist'
        };
      } else {
        $scope.collection = $scope.collections[0];
      }
    });
  };

  $scope.canSave = function() {
    if ($scope.blocked) {
      return false;
    }
    if ($scope.createCollection) {
      if (!$scope.collection.label || !$scope.collection.label.length > 2) {
        return false;
      }
    }
    return $scope.createEntity.$valid;
  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.saveEntity = function() {
    $scope.entity.collections = [$scope.collection.id];
    var res = $http.post('/api/1/entities', $scope.entity);
    res.then(function(res) {
      if ($scope.createAlert) {
        var alert = {entity_id: res.data.id};
        Alert.create({entity_id: res.data.id}).then(function() {
          $uibModalInstance.close(res.data);  
        });
      } else {
        $uibModalInstance.close(res.data);  
      }
    });
    res.error(Validation.handle($scope.createEntity));
  }

  $scope.save = function(form) {
    if (!$scope.canSave()) {
      return false;
    }
    $scope.blocked = true;

    if (!$scope.createCollection) {
      $scope.saveEntity();
    } else {
      var res = $http.post('/api/1/collections', $scope.collection);
      res.then(function(res) {
        $scope.collection = res.data;
        Metadata.flush().then(function() {
          $scope.saveEntity();
        });
      });
      res.error(Validation.handle($scope.createEntity));
    }
  };

}]);
