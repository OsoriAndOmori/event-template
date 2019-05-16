naver = window.naver || {};
naver.sports = naver.sports || {};
naver.sports.m = naver.sports.m || {};
naver.sports.m.common = naver.sports.m.common || {};

naver.sports.m.common.DisplaySspAd = eg.Class({

	construct: function (options) {
		this._initVars(options);
		this._initSpwp();
	},

	_initVars: function (options) {
		this._newsType = options.newsType;
		this._sportsAdConfig = options.sportsAdConfig;
		this._oid = options.oid;
		this._sid1 = options.sid1;
		this._sid2 = options.sid2;
		this._gdid = options.gdid;

		this._unitIdList = [];

		this._enablePersist = options.enablePersist;
	},

	/**
	 * init된 spwp 객체를 리턴
	 *
	 * @returns {생성된 spwp 를 global로 받기위해 리턴}
	 */
	getSpwp: function () {
		return this._spwp;
	},

	getUnitIdList: function () {
		return this._unitIdList;
	},

	/**
	 * 경기 엔드의 경우 탭별로 광고를 매번 초기화 해줘야 하는 이슈가 있음.
	 * 현재는 한 탭에 하나의 광고만 사용하고 있기 때문에 전체 삭제후 추가.
	 * @param unitId
	 * @param divId
	 */
	replaceAdUnit: function (adInfo, divId) {

		this._spwp.cmd.push($.proxy(function () {
			if (this._spwp.adUnits.length > 0) {
				this._spwp.adUnits = [];
			}
		}, this));

		var adUnits = [];
		var adUnit = {extraOption: {}};

		adUnit.unitId = adInfo.serviceUnitId;
		adUnit.divId = divId;

		if (adInfo.calpParameter) {
			adUnit.extraOption.calp = adInfo.calpParameter
		}

		adUnits.push(adUnit);
		this._unitIdList = this._findUnitIdList(adUnits);

		this._spwp.cmd.push($.proxy(function () {
			if (adUnits.length > 0) {
				this._spwp.addAdUnits(adUnits);
				this._spwp.requestAds({
					adUnitIds: this._unitIdList
				});
			}
		}, this));
	},

	refreshAd: function () {
		this._spwp.cmd.push($.proxy(function () {
			this._spwp.requestAds({});
			this._spwp.renderAds({});
		}, this));
	},

	renderAd: function (divId) {
		this._spwp.cmd.push($.proxy(function () {
			this._spwp.renderAd(divId);
		}, this));
	},

	_initSpwp: function () {

		this._spwp = window.spwp || {};
		this._spwp.cmd = this._spwp.cmd || [];
		this._spwp.cmd.push($.proxy(function () {

			this._spwp.setConfig({
				enablePersistAd: this._enablePersist
			});

			var adUnits = this._makeAdUnits();
			this._unitIdList = this._findUnitIdList(adUnits);
			/* SSP 유닛 정보 추가 및 해당 유닛에 대한 광고 요청 */
			if (adUnits.length > 0) {
				this._spwp.addAdUnits(adUnits);
			}

		}, this));
	},

	/**
	 * adUnits의 형태
	 *
	 *       var adUnits = [{
	 *          unitId: "m_sports",
	 *          divId: "sports_placard",
	 *          targeting: { // optional 우린 사용하지 않음
	 *              gen: "M", age: "20", cty: "KR"
	 *          },
	 *          extraOption: {
	 *              oid: "020", sid1: "101", sid2: "234", calp: "home", gdid:"해당값"
	 *          }
	 *      },
	 *      {
	 *          unitId: "m_sports_smb",
	 *          divId: "div-2",
	 *          extraOption: {
	 *              oid: "020", sid1: "101", sid2: "234"
	 *          }
	 *      }];*
	 *
	 * @returns {Array}
	 * @private
	 */
	_makeAdUnits: function () {
		var adUnits = [];
		for (var i = 0; i < this._sportsAdConfig.length; i++) {

			var adInfo = this._sportsAdConfig[i];

			//게임센터의 경우 초기화를 각각의 탭에서 해줘야 하여, 공통 스크립트에서 하지 않는다.
			if (adInfo.serviceUnitId === "m_sports_liveend") {
				continue;
			}

			var adUnit = {extraOption: {}};

			adUnit.unitId = adInfo.serviceUnitId;
			if (this._newsType === "news_end" && adInfo.serviceUnitId === "m_sports_smb") {	// 소상공인 광고
				adUnit.divId = "nmap_sports_news_2";
			} else {	// 기본 광고
				adUnit.divId = "sports_placard";
				if (adInfo.calpParameter) {
					adUnit.extraOption.calp = adInfo.calpParameter;
				}
			}

			if (this._newsType === "news_end") {
				adUnit.extraOption.oid = this._oid;
				adUnit.extraOption.sid1 = this._sid1;
				adUnit.extraOption.sid2 = this._sid2;
				adUnit.extraOption.gdid = this._gdid;
			}

			adUnits.push(adUnit);
		}

		return adUnits;
	},

	_findUnitIdList: function (adUnits) {
		var unitIdList = [];

		for (var i = 0; i < adUnits.length; i++) {
			var adUnit = adUnits[i];
			if (adUnit.unitId) {
				unitIdList.push(adUnit.unitId);
			}
		}

		return unitIdList;
	}
});
