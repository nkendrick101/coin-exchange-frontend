//=require angular-source/components/account/trade/orders/orders.module

'use strict';

angular.module('account.trade.orders').controller('ClosedOrdersController', [
  '$scope', '$filter', 'ClosedOrdersService', 'OrdersSharedService', function ($scope, $filter, closedOrdersService, orderSharedService) {
    var loaded = false;

    $scope.$on('refreshEvent', function(event, data) {
        loadClosedOrders();
    });

    loadClosedOrders();
    function loadClosedOrders(){
        closedOrdersService.query()
            .success(function (data) {
                updateCost(data);
                $scope.orders = data;
                $scope.orders = $filter('orderBy')($scope.orders, $scope.sort.predicate, $scope.sort.reverse);
                setPaginationParams();
                recalculateMinAndMax();
                filterCollection();

                $scope.$parent.closedOrdersLoaded = true;
                loaded = true;
            }).error(function () {
                $scope.orders = [];
                loaded = true;
            });
    }

    $scope.setOrderIdAsUrlParameter = function(orderId){
        $scope.locationPath = '#/account/trade/showOrderDetails?orderid=' + orderId;
    }

    $scope.isLoaded = function () {
      return !loaded;
    };

    $scope.sort = {
      predicate: 'ClosingDateTime',
      reverse: true
    };

    $scope.getSortingClass = function (columnName) {
      var className = 'sorting';

      if ($scope.sort.predicate === columnName) {
        $scope.sort.reverse ? className += '_asc' : className += '_desc';
      }

      return className;
    };

    function updateCost(orders) {
      if (orders.length) {
        orders.forEach(function (order) {
          order['Cost'] = +order['AveragePrice'] * +order['VolumeExecuted'];
        });
      }
    }

    $scope.updateSorting = function (columnName) {
      if ($scope.sort.predicate === columnName) {
        $scope.sort.reverse = !$scope.sort.reverse;
      } else {
        $scope.sort.predicate = columnName;
        $scope.sort.reverse = true;
      }

        $scope.orders = $filter('orderBy')($scope.orders, columnName, $scope.sort.reverse);
        setPaginationParams();
        recalculateMinAndMax();
        filterCollection();
    };

    //Sorting params
    function setPaginationParams() {
      $scope.currentPage = 1;
      $scope.maxSize = 5;
      $scope.totalItems = $scope.orders.length;
    }

    $scope.pageChanged = function () {
      recalculateMinAndMax();
      filterCollection();
    };

    function filterCollection() {
      $scope.filteredOrders = $scope.orders.slice($scope.currentMinIndex, $scope.currentMaxIndex);
    }

    function recalculateMinAndMax() {
      $scope.currentMinIndex = ($scope.currentPage - 1) * 10;
      $scope.currentMaxIndex = Math.min($scope.totalItems, $scope.currentPage * 10);
    }

    $scope.setLabelStyles = function (label) {
      var className = 'label-';
      switch (label) {
        case 'PartiallyFilled':
          className += 'important';
          break;
        case 'Accepted':
          className += 'success';
          break;
        case 'Complete':
          className += 'success';
          break;

        default:
          className += 'inverse';
      }

      return className;
    };
  }]).directive('tabRightClick',['$parse', function($parse) {
        return function(scope, element, attrs) {
            var fn = $parse(attrs.tabRightClick);
            element.bind('contextmenu', function(event) {
                scope.$apply(function() {
                    //            event.preventDefault();
                    fn(scope, {$event:event});
                });
            });
        };
    }]);