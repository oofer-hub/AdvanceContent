var totalSegments = 30;

var segmentOffset = 50;

const tempVec = new Vec2();
const tempVecB = new Vec2();
const tempVecC = new Vec2();

const segmentBullet = new BasicBulletType(8, 17, "shell");
segmentBullet.lifetime = 30;
segmentBullet.bulletWidth = 10;
segmentBullet.bulletHeight = 15;
segmentBullet.bulletShrink = 0.1;
segmentBullet.keepVelocity = false;
segmentBullet.frontColor = Pal.missileYellow;
segmentBullet.backColor = Pal.missileYellowBack;

const scourgeMissile = extend(BasicBulletType, {
	update(b){
		this.super$update(b);
		
		b.velocity().rotate(Mathf.sin(Time.time() + b.id * 4422, this.weaveScale, this.weaveMag) * Time.delta());
	}
});
scourgeMissile.speed = 7;
scourgeMissile.damage = 10;
scourgeMissile.bulletSprite = "missile";
scourgeMissile.weaveScale = 9;
scourgeMissile.weaveMag = 2;
scourgeMissile.homingPower = 1;
scourgeMissile.homingRange = 70;
scourgeMissile.splashDamage = 20;
scourgeMissile.splashDamageRadius = 25;
scourgeMissile.hitEffect = Fx.hitMeltdown;
scourgeMissile.despawnEffect = Fx.none;
scourgeMissile.hitSize = 4;
scourgeMissile.lifetime = 30;
scourgeMissile.bulletWidth = 10;
scourgeMissile.bulletHeight = 16;
scourgeMissile.bulletShrink = 0.1;
scourgeMissile.keepVelocity = false;
scourgeMissile.frontColor = Pal.missileYellow;
scourgeMissile.backColor = Pal.missileYellowBack;

const scourgeBullet = extend(BasicBulletType, {
	update(b){
		this.super$update(b);
		
		b.velocity().rotate(Mathf.sin(Time.time() + b.id * 4422, this.weaveScale, this.weaveMag) * Time.delta());
	}
});
scourgeBullet.speed = 7;
scourgeBullet.damage = 40;
scourgeBullet.bulletSprite = "shell";
scourgeBullet.weaveScale = 12;
scourgeBullet.weaveMag = 6;
scourgeBullet.homingPower = 1;
scourgeBullet.homingRange = 60;
scourgeBullet.splashDamage = 30;
scourgeBullet.splashDamageRadius = 20;
scourgeBullet.hitEffect = Fx.hitMeltdown;
scourgeBullet.despawnEffect = Fx.none;
scourgeBullet.hitSize = 4;
scourgeBullet.lifetime = 30;
scourgeBullet.pierce = true;
scourgeBullet.bulletWidth = 12;
scourgeBullet.bulletHeight = 21;
scourgeBullet.bulletShrink = 0.1;
//scourgeBullet.keepVelocity = false;
scourgeBullet.frontColor = Pal.missileYellow;
scourgeBullet.backColor = Pal.missileYellowBack;

const bulletCollision = (owner, bullet) => {
	var threshold = Math.max(800 * owner.healthf(), 40);
	//var threshold = Math.max(30 * owner.healthf(), 30);
	var damageMul = 1;
	var bulletType = bullet.getBulletType();
	var tempBulletType = bulletType;
	for(var i = 0; i < 5; i++){
		if(tempBulletType.fragBullet != null){
			damageMul *= tempBulletType.fragBullets;
			tempBulletType = tempBulletType.fragBullet;
		};
	};
	//print((bulletType.damage + bulletType.splashDamage) * damageMul);
	if((bulletType.damage + bulletType.splashDamage) * damageMul > threshold){
		var bulletOwner = bullet.getOwner();
		var bulletAngle = Angles.angle(bullet.x, bullet.y, bulletOwner.x, bulletOwner.y);
		
		var tempB = Bullet.create(bulletType, bulletOwner, bulletOwner.getTeam(), bullet.x, bullet.y, bulletAngle);
		tempB.velocity(bulletType.speed, bulletAngle);
		tempB.resetOwner(owner, owner.getTeam());
		
		bullet.deflect();
		//bullet.time(bulletType.lifetime);
		owner.healBy(bulletType.damage + bulletType.splashDamage);
		bullet.velocity(bulletType.speed, bulletAngle);
		bullet.resetOwner(owner, owner.getTeam());
		bullet.time(0);
		//print("deflected");
	}
};

const scourgeSegment = prov(() => {
	scourgeSegmentB = extend(FlyingUnit, {
		update(){
			if((this.getParentUnit() == null || (this.getParentUnit().isDead() && this.getParentUnit() != null)) && !this.isDead()){
				//this.kill();
				this.remove();
			};
			
			if(this.isDead()){
				this.remove();
				return;
			};
			
			this.health = this.getTrueParentUnit().health();
			
			if(Vars.net.client()){
				this.interpolate();
				this.status.update(this);
				return;
			};
			
			this.updateTargeting();
			
			this.state.update();
			//this.updateVelocityStatus();
			
			if(this.target != null) this.behavior();
			
			//this.super$update();
			
			//this.updateRotation();
			
			//this.updatePosition();
		},
		
		collision(other, x, y){
			this.super$collision(other, x, y);
			
			if(other instanceof DamageTrait && other instanceof Bullet){
				if(other.getBulletType().pierce) other.scaleTime(other.getBulletType().damage / 10);
				
				bulletCollision(this, other);
			};
		},
		
		isDead(){
			if(this.getParentUnit() == null) return true;
			return this.getParentUnit().isDead();
		},
		
		drawSize(){
			if(!this.getDrawerUnit()) return this.getType().hitsize * 10;
			return (segmentOffset * totalSegments) * 2;
		},
		
		drawCustom(){
			this.super$drawAll();
			
			if(this.getParentUnit() == null) return;
			
			this.getParentUnit().drawCustom();
		},
		
		drawAll(){
			if(this.getDrawerUnit()){
				this.drawCustom();
			};
		},
		
		updateCustom(){
			if(this.getTrueParentUnit() != null){
				this.hitTime = this.getTrueParentUnit().getHitTime();
			};
			
			this.updateRotation();
			
			this.updatePosition();
			
			this.updateVelocityStatus();
			
			if(this.getChildUnit() == null) return;
			
			this.getChildUnit().updateCustom();
		},
		
		damage(amount){
			if(this.getTrueParentUnit() == null) return;
			this.getTrueParentUnit().damage(amount);
		},
		
		healBy(amount){
			if(this.getTrueParentUnit() == null) return;
			this.getTrueParentUnit().healBy(amount);
		},
		
		setChildUnit(a){
			this._childUnit = a;
		},
		
		getDrawerUnit(){
			return this._drawer;
		},
		
		setDrawerUnit(a){
			this._drawer = a;
		},
		
		getChildUnit(){
			if(this._childUnit != null && this._childUnit instanceof Number){
				if(this._childUnit == -1){
					this._childUnit = null;
					return null;
				};
				this.setChildUnit(Vars.unitGroup.getByID(this._childUnit));
			};
			
			return this._childUnit;
		},
		
		setParentUnit(a){
			this._parentUnit = a;
		},
		
		setTrueParentUnit(a){
			this._trueParentUnit = a;
		},
		
		getParentUnit(){
			if(this._parentUnit != null && this._parentUnit instanceof Number){
				if(this._parentUnit == -1){
					this._parentUnit = null;
					return null
				};
				this.setTrueParentUnit(Vars.unitGroup.getByID(this._parentUnit));
			};
			
			return this._parentUnit;
		},
		
		getTrueParentUnit(){
			if(this._trueParentUnit != null && this._trueParentUnit instanceof Number){
				if(this._trueParentUnit == -1){
					this._trueParentUnit = null;
					return null
				};
				this.setTrueParentUnit(Vars.unitGroup.getByID(this._trueParentUnit));
			};
			
			return this._trueParentUnit;
		},
		
		drawWeapons(){
			for(var s = 0; s < 2; s++){
				sign = Mathf.signs[s];
				var tra = this.rotation - 90;
				//print(this.type.weapon.region);
				var trY = -this.type.weapon.getRecoil(this, sign > 0) + this.type.weaponOffsetY;
				var w = -sign * this.type.weapon.region.getWidth() * Draw.scl;
				
				Draw.rect(this.type.weapon.region,
				this.x + Angles.trnsx(tra, this.getWeapon().width * sign, trY),
				this.y + Angles.trnsy(tra, this.getWeapon().width * sign, trY), w, this.type.weapon.region.getHeight() * Draw.scl, this.weaponAngles[s] - 90);
			}
		},
		
		drawUnder(){
		},
		
		/*updatePosition(){
			if(this.getParentUnit() == null) return;
			var parentB = this.getParentUnit();
			
			tempVecB.trns(this.rotation, segmentOffset / 2);
			tempVecB.add(this.x, this.y);
			tempVec.trns(this.getParentUnit().rotation - 180, segmentOffset / 2);
			//tempVec.trns(parentB.velocity().angle() - 180, segmentOffset / 2);
			tempVec.add(parentB.x, parentB.y);
			
			var dst = Mathf.dst(tempVecB.x, tempVecB.y, tempVec.x, tempVec.y);
			
			var angle = Angles.angle(tempVecB.x, tempVecB.y, tempVec.x, tempVec.y);
			
			tempVec.setZero();
			tempVecB.setZero();
			
			tempVec.trns(angle, dst);
			//tempVecB.set(tempVec);
			//tempVecB.scl(0.5);
			//tempVecB.limit(1);
			
			//this.velocity().add(tempVecB.x, tempVecB.y);
			
			tempVec.add(this.x, this.y);
			
			this.set(tempVec.x, tempVec.y);
			
			tempVec.setZero();
			//tempVecB.setZero()
		},*/
		
		/*updatePosition(){
			if(this.getParentUnit() == null || this.getTrueParentUnit() == null) return;
			
			//this.updatePositionAlt();
			
			var parentB = this.getParentUnit();
			
			var dst = Mathf.dst(this.x, this.y, parentB.x, parentB.y) - segmentOffset;
			
			var angle = Angles.angle(this.x, this.y, parentB.x, parentB.y);
			var vel = this.velocity();
			
			if(!Mathf.within(this.x, this.y, parentB.x, parentB.y, segmentOffset)){
				tempVec.trns(angle, dst);
				
				tempVecB.trns(angle, parentB.velocity().len());
				
				vel.add(tempVecB.x, tempVecB.y);
				if(Mathf.within(this.x + vel.x, this.y + vel.y, parentB.x, parentB.y, segmentOffset)){
					this.moveBy(-tempVec.x, -tempVec.y);
				};
				this.moveBy(tempVec.x, tempVec.y);
			};
			dst = Mathf.dst(this.x, this.y, parentB.x, parentB.y) - segmentOffset;
			if(dst < 0){
				angle = Angles.angle(this.x, this.y, parentB.x, parentB.y);
				tempVec.trns(angle, dst);
				//vel.add(tempVec.x, tempVec.y);
				this.moveBy(tempVec.x / 4, tempVec.y / 4);
			};
		},*/
		
		updatePosition(){
			if(this.getParentUnit() == null || this.getTrueParentUnit() == null) return;
			
			//this.updatePositionAlt();
			
			var parentB = this.getParentUnit();
			
			var dst = Mathf.dst(this.x, this.y, parentB.x, parentB.y) - segmentOffset;
			
			tempVecC.trns(parentB.velocity().angle, segmentOffset / 2.5);
			
			var angle = Angles.angle(this.x, this.y, parentB.x + tempVecC.x, parentB.y + tempVecC.y);
			var vel = this.velocity();
			
			if(!Mathf.within(this.x, this.y, parentB.x, parentB.y, segmentOffset)){
				tempVec.trns(angle, dst);
				
				//tempVecB.trns(angle, parentB.velocity().len());
				tempVecB.trns(angle, Math.max(parentB.velocity().len(), this.velocity().len()));
				
				vel.add(tempVecB.x * Time.delta(), tempVecB.y * Time.delta());
				if(Mathf.within(this.x + vel.x, this.y + vel.y, parentB.x, parentB.y, segmentOffset)){
					this.moveBy(-tempVec.x / 1.1, -tempVec.y / 1.1);
				};
				this.moveBy(tempVec.x / 1.01, tempVec.y / 1.01);
			};
			dst = Mathf.dst(this.x, this.y, parentB.x, parentB.y) - segmentOffset;
			if(dst < 0){
				angle = Angles.angle(this.x, this.y, parentB.x, parentB.y);
				tempVec.trns(angle, dst);
				//vel.add(tempVec.x, tempVec.y);
				this.moveBy(tempVec.x / 4, tempVec.y / 4);
			};
		},
		
		/*updatePositionAlt(){
			var parentB = this.getParentUnit();
			
			tempVecB.trns(parentB.velocity().angle() - 180, segmentOffset / 2);
			tempVecB.add(parentB.x, parentB.y);
			
			tempVec.trns(this.rotation, segmentOffset / 2);
			tempVec.add(this.x, this.y);
			
			var dst1 = Mathf.dst(tempVec.x, tempVec.y, tempVecB.x, tempVecB.y) / Time.delta();
			var angle1 = Angles.angle(tempVec.x, tempVec.y, tempVecB.x, tempVecB.y);
			
			tempVec.trns(parentB.velocity().angle() - 180, segmentOffset / 2);
			tempVec.add(parentB.x, parentB.y);
			
			var angle2 = Angles.angle(this.x, this.y, tempVec.x, tempVec.y);
			
			//var angle3 = Angles.angle(this.x, this.y, parentB.x, parentB.y);
			
			this.velocity().trns(angle2, parentB.velocity().len());
			
			if(dst1 > 0.002){
				
				if(Angles.near(angle1, this.velocity().angle(), 12)){
					this.velocity().trns(angle1, parentB.velocity().len() + dst1);
				};
				
				//tempVec.trns(angle1, dst1);
				//tempVec.trns(parentB.velocity().len() - 180, segmentOffset / 2);
				//tempVec.add(parentB.x, parentB.y);
				//tempVecB.trns(this.rotation - 180, segmentOffset / 2);
				//tempVec.add(tempVecB);
				//this.set(tempVec.x, tempVec.y);
				//this.moveBy(tempVec.x, tempVec.y);
			};
			tempVec.setZero();
			tempVecB.setZero();
		},*/
		
		updateRotation(){
			if(this.getParentUnit() == null) return;
			tempVec.trns(this.getParentUnit().rotation - 180, (segmentOffset / 4));
			tempVec.add(this.getParentUnit().x, this.getParentUnit().y);
			//tempVec.set(this.getParentUnit().x, this.getParentUnit().y);
			this.rotation = Angles.angle(this.x, this.y, tempVec.x, tempVec.y);
			tempVec.setZero();
		},
		
		/*added(){
			this.super$added();
			
			this.repairItself();
		},*/
	});
	//scourgeSegmentB.repaired = false;
	//scourgeSegmentB.parentID = -1;
	scourgeSegmentB.setDrawerUnit(false);
	scourgeSegmentB.setParentUnit(null);
	scourgeSegmentB.setTrueParentUnit(null);
	scourgeSegmentB.setChildUnit(null);
	return scourgeSegmentB;
});

const scourgeMain = prov(() => {
	scourgeMainB = extend(FlyingUnit, {
		update(){
			this.super$update();
			
			if(this.getChildUnit() != null) this.getChildUnit().updateCustom();
			//print(this.health() + "/" + this.maxHealth());
		},
		
		added(){
			this.super$added();
			
			//if(!this.loaded) this.trueHealth = this.getType().health * totalSegments;
			unitTypeArray = [scourgeUnitSegment, scourgeUnitMissile];
			
			if(/*!this.loaded*/ true){
				this.trueHealth = this.getType().health * totalSegments;
				var parent = this;
				//var weaponArray = [scourgeSegWeap, scourgeSegSwarmer];
				for(var i = 0; i < totalSegments; i++){
					//type = i < totalSegments - 1 ? scourgeUnitSegment : scourgeUnitTail;
					//type = i < totalSegments - 1 ? (i % 2) == 0 ? scourgeUnitMissile : scourgeUnitSegment : scourgeUnitTail;
					type = i < totalSegments - 1 ? unitTypeArray[i % 2] : scourgeUnitTail;
					
					base = type.create(this.getTeam());
					base.setParentUnit(parent);
					base.setTrueParentUnit(this);
					base.setDrawerUnit(type == scourgeUnitTail);
					base.add();
					//base.set(this.x + Mathf.random(12), this.y + Mathf.random(12));
					//print(this.rotation);
					tempVec.trns(this.rotation + 180, (segmentOffset * i));
					base.set(this.x + tempVec.y, this.y + tempVec.y);
					base.rotation = this.rotation;
					parent.setChildUnit(base);
					parent = base;
				}
			};
		},
		
		getHitTime(){
			return this.hitTime;
		},
		
		collision(other, x, y){
			this.super$collision(other, x, y);
			
			if(other instanceof DamageTrait && other instanceof Bullet){
				if(other.getBulletType().pierce) other.scaleTime(other.getBulletType().damage / 10);
				
				bulletCollision(this, other);
			};
		},
		
		calculateDamage(amount){
			var trueAmount = amount;
			//if(amount >= 3000) trueAmount = Math.max(6000 - amount, Math.log(amount) * 2);
			if(amount >= 3000) trueAmount = 3000 + (Math.log(amount - 2999) * 20);
			return (trueAmount / (totalSegments / 2)) * Mathf.clamp(1 - this.status.getArmorMultiplier() / 100);
		},
		
		/*health(){
			var healthTotal = 0;
			var child = this;
			for(var i = 0; i < totalSegments; i++){
				//if(child == null) break;
				healthTotal += child.health;
				child = child.getChildUnit();
				if(child == null) break;
			};
			
			return healthTotal;
			//print(this.health() + "/" + this.maxHealth());
		},
		
		maxHealth(){
			var healthTotal = 0;
			var child = this;
			for(var i = 0; i < totalSegments; i++){
				//if(child == null) break;
				healthTotal += this.getType().health;
				//child = child.getChildUnit();
				//if(child == null) break;
			};
			
			return healthTotal * Vars.state.rules.unitHealthMultiplier;
		},*/
		
		drawCustom(){
			this.drawAll();
		},
		
		drawUnder(){
		},
		
		/*maxHealth(){
			return this.getType().health * totalSegments * Vars.state.rules.unitHealthMultiplier;
		},*/
		
		getParentUnit(){
			return null;
		},
		
		setChildUnit(a){
			this._childUnit = a;
		},
		
		getChildUnit(){
			if(this._childUnit != null && this._childUnit instanceof Number){
				if(this._childUnit == -1){
					this._childUnit = null;
					return null;
				};
				
				this.setChildUnit(Vars.unitGroup.getByID(this._childUnit));
			};
			
			return this._childUnit;
		}
		
		/*writeSave(stream){
			this.writeSave(stream, false);
			stream.writeByte(this.type.id);
			stream.writeInt(this.spawner);
			stream.writeFloat(this.health);
		},
		
		readSave(stream, version){
			this.super$readSave(stream, version);
			var trueHealth = stream.readFloat();
			
			this.health = trueHealth;
		},
		
		write(data){
			this.super$write(data);
			data.writeFloat(this.health);
		},
		
		read(data){
			this.super$readSave(data, this.version());
			var trueHealth = data.readFloat();
			
			this.health = trueHealth;
		}*/
	});
	//scourgeMainB.trueHealth = 0;
	scourgeMainB.setChildUnit(null);
	return scourgeMainB;
})

const scourgeSegWeap = extendContent(Weapon, "scourge-segment-equip", {
	load(){
		this.region = Core.atlas.find("advancecontent-scourge-segment-equip");
	}
});

scourgeSegWeap.reload = 9;
scourgeSegWeap.alternate = true;
scourgeSegWeap.length = 8;
scourgeSegWeap.width = 19;
scourgeSegWeap.ignoreRotation = true;
scourgeSegWeap.bullet = segmentBullet;
scourgeSegWeap.shootSound = Sounds.shootSnap;

const scourgeSegSwarmer = extendContent(Weapon, "scourge-segment-swarmer", {
	load(){
		this.region = Core.atlas.find("advancecontent-scourge-segment-swarmer");
	}
});

scourgeSegSwarmer.reload = 18;
scourgeSegSwarmer.alternate = true;
scourgeSegSwarmer.spacing = 8;
scourgeSegSwarmer.shots = 6;
scourgeSegSwarmer.length = 8;
scourgeSegSwarmer.width = 19;
scourgeSegSwarmer.ignoreRotation = true;
scourgeSegSwarmer.bullet = scourgeMissile;
scourgeSegSwarmer.shootSound = Sounds.missile;

const scourgeHeadWeap = extendContent(Weapon, "scourge-head-equip", {});

scourgeHeadWeap.reload = 25;
scourgeHeadWeap.alternate = true;
scourgeHeadWeap.spacing = 4;
scourgeHeadWeap.shots = 15;
scourgeHeadWeap.length = 16;
scourgeHeadWeap.width = 0;
scourgeHeadWeap.ignoreRotation = false;
scourgeHeadWeap.bullet = scourgeBullet;
scourgeHeadWeap.shootSound = Sounds.artillery;

const loadImmunities = unitType => {
	var statuses = Vars.content.getBy(ContentType.status);
	statuses.each(cons(stat => {
		if(stat != null){
			unitType.immunities.add(stat);
		}
	}));
};

const scourgeUnitTail = extendContent(UnitType, "scourge-tail", {
	init(){
		this.super$init();
		
		loadImmunities(this);
	},
	
	isHidden(){
		return true;
	}
});

scourgeUnitTail.localizedName = "Zenith Tail";
scourgeUnitTail.create(scourgeSegment);
scourgeUnitTail.weapon = scourgeSegWeap;
scourgeUnitTail.engineSize = 0;
scourgeUnitTail.engineOffset = 0;
scourgeUnitTail.flying = true;
scourgeUnitTail.rotateWeapon = true;
scourgeUnitTail.shootCone = 360;
scourgeUnitTail.health = 32767;
scourgeUnitTail.mass = 11;
scourgeUnitTail.hitsize = segmentOffset / 1.5;
scourgeUnitTail.speed = 0;
scourgeUnitTail.drag = 0.07;
scourgeUnitTail.attackLength = 130;
scourgeUnitTail.range = 150;
scourgeUnitTail.maxVelocity = 4.92;

const scourgeUnitMissile = extendContent(UnitType, "scourge-segment-missile", {
	load(){
		this.super$load();
		
		this.weapon.load();
		this.region = Core.atlas.find("advancecontent-scourge-segment");
	},
	
	init(){
		this.super$init();
		
		loadImmunities(this);
	},
	
	icon(icon){
		if(this.cicons[icon.ordinal()] == null){
			this.cicons[icon.ordinal()] = Core.atlas.find("advancecontent-scourge-segment");
		};
		
		return this.cicons[icon.ordinal()];
	},
	
	isHidden(){
		return true;
	}
});

scourgeUnitMissile.localizedName = "Zenith Missile Segment";
scourgeUnitMissile.create(scourgeSegment);
scourgeUnitMissile.weapon = scourgeSegSwarmer;
scourgeUnitMissile.engineSize = 0;
scourgeUnitMissile.engineOffset = 0;
scourgeUnitMissile.flying = true;
scourgeUnitMissile.rotateWeapon = true;
scourgeUnitMissile.shootCone = 360;
scourgeUnitMissile.health = 32767;
scourgeUnitMissile.mass = 11;
scourgeUnitMissile.hitsize = segmentOffset / 1.5;
scourgeUnitMissile.speed = 0;
scourgeUnitMissile.drag = 0.07;
scourgeUnitMissile.attackLength = 130;
scourgeUnitMissile.range = 150;
scourgeUnitMissile.maxVelocity = 4.92;

const scourgeUnitSegment = extendContent(UnitType, "scourge-segment", {
	init(){
		this.super$init();
		
		loadImmunities(this);
	},
	
	isHidden(){
		return true;
	}
});

scourgeUnitSegment.localizedName = "Zenith Segment";
scourgeUnitSegment.create(scourgeSegment);
scourgeUnitSegment.weapon = scourgeSegWeap;
scourgeUnitSegment.engineSize = 0;
scourgeUnitSegment.engineOffset = 0;
scourgeUnitSegment.flying = true;
scourgeUnitSegment.rotateWeapon = true;
scourgeUnitSegment.shootCone = 360;
scourgeUnitSegment.health = 32767;
scourgeUnitSegment.mass = 11;
scourgeUnitSegment.hitsize = segmentOffset / 1.5;
scourgeUnitSegment.speed = 0;
scourgeUnitSegment.drag = 0.07;
scourgeUnitSegment.attackLength = 130;
scourgeUnitSegment.range = 150;
scourgeUnitSegment.maxVelocity = 4.92;

const scourgeUnit = extendContent(UnitType, "scourge", {
	init(){
		this.super$init();
		
		loadImmunities(this);
	},
	
	displayInfo(table){
		table.table(cons(title => {
			title.addImage(this.icon(Cicon.xlarge)).size(8 * 6);
			title.add("[accent]" + this.localizedName).padLeft(5);
		}));
		
		table.row();
		
		table.addImage().height(3).color(Color.lightGray).pad(15).padLeft(0).padRight(0).fillX();
		
		table.row();
		
		if(this.description != null){
			table.add(this.displayDescription()).padLeft(5).padRight(5).width(400).wrap().fillX();
			table.row();

			table.addImage().height(3).color(Color.lightGray).pad(15).padLeft(0).padRight(0).fillX();
			table.row();
		};
		
		table.left().defaults().fillX();

		table.add(Core.bundle.format("unit.health", this.health));
		table.row();
		table.add(Core.bundle.format("unit.speed", Strings.fixed(this.speed, 1)));
		table.row();
		var resistance = (1 - (1 / (totalSegments / 2))) * 100;
		table.add("Damage Resistance: " + resistance.toFixed(1) + "%").color(Color.lightGray);
		table.row();
		table.row();
	}
});

scourgeUnit.localizedName = "Zenith Devourer";
scourgeUnit.create(scourgeMain);
scourgeUnit.description = "Prepare to lose Everything.";
scourgeUnit.weapon = scourgeHeadWeap;
scourgeUnit.engineSize = 0;
scourgeUnit.engineOffset = 0;
scourgeUnit.flying = true;
scourgeUnit.health = 32767;
scourgeUnit.mass = 11;
scourgeUnit.hitsize = segmentOffset / 1.5;
scourgeUnit.speed = 0.34;
scourgeUnit.drag = 0.09;
scourgeUnit.attackLength = 170;
scourgeUnit.range = 180;
scourgeUnit.maxVelocity = 4.92;
scourgeUnit.shootCone = 30;
scourgeUnit.rotatespeed = 0.015;
scourgeUnit.baseRotateSpeed = 0.005;

/*const tempFac = extendContent(UnitFactory, "temp-factory", {});

tempFac.unitType = scourgeUnit;*/