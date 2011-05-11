/*
 *1.区分是继承于 vector还是scene的主要是看其是否需要一个自己的变形矩阵 transform
 **/

var Klass = (function() {
    var __extending = {};

    return {
        extend: function(parent, def) {
            if (arguments.length == 1) {
                def = parent;
                parent = null;
            }
            var func = function() {
                if (arguments[0] ==  __extending) {
                    return;
                }
                this.initialize.apply(this, arguments);

            };
            if (typeof(parent) == 'function') {
                func.prototype = new parent( __extending);
            }
            var mixins = [];
            if (def && def.include) {
                if (def.include.reverse) {
                    // methods defined in later mixins should override prior
                    mixins = mixins.concat(def.include.reverse());
                } else {
                    mixins.push(def.include);
                }
                delete def.include; // clean syntax sugar
            }
            if (def) Klass.inherit(func.prototype, def);
            for (var i = 0; (mixin = mixins[i]); i++) {
                Klass.mixin(func.prototype, mixin);
            }
            return func;
        },
        mixin: function (dest, src, clobber) {
            clobber = clobber || false;
            if (typeof(src) != 'undefined' && src !== null) {
                for (var prop in src) {
                    if (clobber || (!dest[prop])) {
                        dest[prop] = src[prop];
                    }
                }
            }
            return dest;
        },
        inherit: function(dest, src, fname) {
            if (arguments.length == 3) {
                var ancestor = dest[fname], descendent = src[fname], method = descendent;
                descendent = function() {
                    var ref = this.parent;
                    this.parent = ancestor;
                    var result = method.apply(this, arguments);
                    ref ? this.parent = ref : delete this.parent;
                    return result;
                };
                // mask the underlying method
                descendent.valueOf = function() {
                    return method;
                };
                descendent.toString = function() {
                    return method.toString();
                };
                dest[fname] = descendent;
            } else {
                for (var prop in src) {
                    if (dest[prop] && typeof(src[prop]) == 'function') {
                        Klass.inherit(dest, src, prop);
                    } else {
                        dest[prop] = src[prop];
                    }
                }
            }
            return dest;
        },
        /*扩展的一个静态方法,为了判断类型*/
        type:function(instance){
            return instance.type||typeof instance;
        }
    };
})();
Klass.create = function() {
    return Klass.extend.apply(this, arguments);
};









(function(){
    var m3d=this.m3d={
        version:  'v0.1'
    }
    /*各个基础工具函数与变量*/
    var PHI=1.61803398874989484820458683,
    percision=1e-5;
    var isEnumerable=function(item){
        var toString = Object.prototype.toString;
        return (item != null && typeof item.length == 'number' && toString.call(item) != '[object Function]' );
    };
    var def=function(item){
        return typeof item !== "undefined";
    };
    var include=function(obj,obj2,override){
        for(var i in obj2){
            if(obj2.hasOwnProperty(i)&&(obj[i]==null||override)){
                obj[i]=obj2[i]
            }
        }
        return obj;
    };
    var $A=function(item){
        var slice=Array.prototype.slice;
        if (item == null) return [];
        return (isEnumerable(item) && typeof item != 'string') ? (item instanceof Array) ? item : slice.call(item) : [item];
    };
    var  $V=function(obj){
        
        if(obj instanceof Array){
            obj={
                x:obj[0],
                y:obj[1],
                z:obj[2]
            }
            return obj
        } 
        return obj||{
            x:0,
            y:0,
            z:0
        };
    };
    var IM={
        
    }
    var $M=function(obj){
        if(!obj){
            return {
                n00:1,
                n01:0,
                n02:0,
                n03:0,
                n10:0,
                n11:1,
                n12:0,
                n13:0,
                n20:0,
                n21:0,
                n22:1,
                n23:0
            }
        }
        if(obj instanceof Array){
            var result={};
            for(var i=0,l=obj.length;i<l;i++){
                for(var j=0,c=obj[0].length;j<c;j++){
                    result[('n'+i)+j]=obj[i][j];
                }
            }
            return result;
        }
        include(obj, {
            n00:1,
            n01:0,
            n02:0,
            n03:0,
            n10:0,
            n11:1,
            n12:0,
            n13:0,
            n20:0,
            n21:0,
            n22:1,
            n23:0
        })
        return obj

    };
    var $a2c=function(a){
        a[0]=Math.floor(a[0])
        a[1]=Math.floor(a[1])
        a[2]=Math.floor(a[2])
        return "rgba("+a.join()+")";
    };
    var each=function(item,func){
        if(isEnumerable(item))
            for(var i=0,l=item.length;i<l;i++){
                func.call(this,item[i],i);
            }
        
    };
    var $E=function(name){
        return document.createElement(name);
    };
    var asset=function(source){
        var script=$E('script');
        script.src=source;
        script.type= 'text/javascript';
        var head=document.getElementsByTagName('head')[0];
        head.appendChild(script);
    }






    var Vector=Klass.create({
        type:'vector',
        initialize: function(obj){
            this.set(obj);
        },
        /*每个继承类必须实现*/
        dup:function(){
            return new Vector(this);
        },
        set:function(obj){
            obj=$V(obj)
            this.x=obj.x;
            this.y=obj.y;
            this.z=obj.z;
            return this;
        },
        toString:function(){
            return '['+this.x+','+this.y+','+this.z+']';
        },

        add: function(v,restrain){
            if(!restrain){
                this.x += v.x;
                this.y += v.y;
                this.z += v.z;
                return this;
            }else{
                return this.dup().add(v);
            }
           
        },

        sub: function(v,restrain){
            if(!restrain){
                this.x -= v.x;
                this.y -= v.y;
                this.z -= v.z;
                return this;
            }else{
                return this.dup().sub(v);
            }
        },
        multi:function(v,restrain){
            if(!restrain){
                this.x *= v;
                this.y *=v;
                this.z *=v;
                return this;
            }else{
                return this.dup().multi(v);
            }
        },
        reverse:function(restrain){
            if(!restrain){
                return this.multi(-1);
            }else{
                return this.dup().reverse();
            }
        },
        cross: function(v){
            var n=new Vector(v);
            var tx = this.x;
            var ty = this.y;
            var tz = this.z;

            n.x = ty * v.z - tz * v.y;
            n.y = tz * v.x - tx * v.z;
            n.z = tx * v.y -ty * v.x;
            return n;
        },

        dot:function(v){
            return this.x*v.x+this.y*v.y+this.z*v.z;
        },
        distanceTo: function(v){
            var dx = this.x - v.x;
            var dy = this.y - v.y;
            var dz = this.z - v.z;

            return Math.sqrt(dx * dx + dy * dy + dz *dz);
        },
        angleTo:function(v){
            v=new Vector(v);
            var m_modulo=this.modulo()*v.modulo();
            if(m_modulo<percision) return "parameters's modulo can't be zero " ;
            var dot=this.dot(v);
            return Math.acos(dot/m_modulo);

        },
        modulo:function(){
            return this.distanceTo({
                x:0,
                y:0,
                z:0
            });
        },
        normalize:function(restrain){
            var mo=this.modulo();
            if(mo==0) return this;
            return this.multi(1/mo,restrain);
        },
        transform:function(m,restrain){
            return m. transform(this,restrain);
        },
        rotateX:function(angle,restrain){
            return this.transform(Matrix.rotateX(angle),restrain);
        },
        rotateY:function(angle,restrain){
            return this.transform(Matrix.rotateY(angle),restrain);
        },
        rotateZ:function(angle,restrain){
            return this.transform(Matrix.rotateZ(angle),restrain);
        },
        rotate:function(ax,angle,restrain){
            return this.transform(Matrix.rotate(ax,angle),restrain);
        },
        translate:function(x,y,z,restrain){
            return this.transform(Matrix.translate(x, y, z),restrain);
        },
        scale:function(x,y,z,restrain){
            return this.transform(Matrix.scale(x, y, z),restrain);
        }
    })
    Klass.mixin(Vector,{
        create:function(obj){
            return new Vector(obj);
        },
        average:function(ps){
            var result=new Vector();
            for(var i=0,l=ps.length;i<l;i++){
                var p=ps[i];
                result.add(p)
            }
            return result.multi(1/l);
        },
        register:function(obj,callback){
            if(!m3d.util['vector'][obj]) asset('m3d/util/vector/'+obj+'.js');
            var timer=setInterval(function(){
                if(!m3d.util['vector'][obj]) {
                    return;
                }
                Klass.mixin(Vector.prototype, m3d.util['vector'][obj]);
                clearInterval(timer);
                callback.call(this,m3d.util['vector'][obj]);
            },50)
        }
    })
    var Matrix=Klass.create({
        type:'matrix',
        /*
         *   1 0 0 0
         *   0 1 0 0
         *   0 0 1 0
         *   0 0 0 1 这一行省略 但在计算中应用
         */
        initialize: function(obj){
            this.set(obj);
        },
        set:function(obj){
            obj=$M(obj);
            include(this,obj,true);
            return this;
        },
        reset:function(){
            return this.set();
        },
        e:function(i,j){
            return this[('n'+i)+j];
        } ,
        dup:function(){
            return new Matrix(this);
        },
        //可以以连乘的形式左乘m,
        multi:function(m,restrain){
            if(!restrain){
                m=new Matrix(m);
                var n00=this.n00,n01=this.n01,n02=this.n02,n03=this.n03,
                n10=this.n10,n11=this.n11,n12=this.n12,n13=this.n13,
                n20=this.n20,n21=this.n21,n22=this.n22,n23=this.n23;
                this.n00=m.n00*n00+m.n01*n10+m.n02*n20;
                this.n01=m.n00*n01+m.n01*n11+m.n02*n21;
                this.n02=m.n00*n02+m.n01*n12+m.n02*n22;
                this.n03=m.n00*n03+m.n01*n13+m.n02*n23+m.n03;

                this.n10=m.n10*n00+m.n11*n10+m.n12*n20;
                this.n11=m.n10*n01+m.n11*n11+m.n12*n21;
                this.n12=m.n10*n02+m.n11*n12+m.n12*n22;
                this.n13=m.n10*n03+m.n11*n13+m.n12*n23+m.n13;

                this.n20=m.n20*n00+m.n21*n10+m.n22*n20;
                this.n21=m.n20*n01+m.n21*n11+m.n22*n21;
                this.n22=m.n20*n02+m.n21*n12+m.n22*n22;
                this.n23=m.n20*n03+m.n21*n13+m.n22*n23+m.n23;
                return this;
            }else{
                return this.dup().multi(m);
            }
        },
        //offsetLess:是否忽略计算偏移量
        transform:function(v,restrain,offsetLess){
            if(!restrain){
                var vx = v.x, vy = v.y, vz = v.z;
                v.x = this.n00 * vx + this.n01 * vy + this.n02 * vz+(offsetLess?0:this.n03);
                v.y = this.n10 * vx + this.n11 * vy + this.n12 * vz+(offsetLess?0:this.n13);
                v.z = this.n20 * vx + this.n21 * vy + this.n22 * vz+(offsetLess?0:this.n23);
                return v;
            }else{
                return this.transform(v.dup(),false,offsetLess)
            }
        },
        transforms:function(vs,restrain,offsetLess){
            var tmp=[];
            for(var i=0,l=vs.length;i<l;i++){
                tmp.push(this.transform(vs[i],restrain,offsetLess));
            }
            return tmp;
        },
        /*处理一些平面，或者垂直线向量 这些都与位移无关*/
        removeOffset:function(restrain){
            if(!restrain){
                this.n03=0;
                this.n13=0;
                this.n23=0;
                return this
            }else{
                return this.dup().removeOffset();
            }
        },
        //求行列式
        det:function(){
            return this.n00*this.n11*this.n22+this.n01*this.n12*this.n20+this.n02*this.n10*this.n21
            -this.n00*this.n12*this.n21-this.n01*this.n10*this.n22-this.n02*this.n11*this.n20;
        },
        //乘以常数
        multiScale:function(s,restrain){
            if(!restrain){
                this.n00 *= s;
                this.n01 *= s;
                this.n02 *= s;
                this.n03 *= s;
                this.n10 *= s;
                this.n11 *= s;
                this.n12 *= s;
                this.n13 *= s;
                this.n20 *= s;
                this.n21 *= s;
                this.n22 *= s;
                this.n23 *= s;
                return this;
            }else{
                return this.dup().multiScale(s);
            }
        },
        //求逆,由于第四行的特殊性,以及旋转矩阵的正交性,公式相比一般四维矩阵求逆简单的多
        inverse:function(restrain){
            if(!restrain){
                var det=this.det();
                var m00 = this.n00, m01 = this.n01, m02 = this.n02, m03 = this.n03,
                m10 = this.n10, m11 = this.n11, m12 = this.n12, m13 = this.n13,
                m20 = this.n20, m21 = this.n21, m22 = this.n22, m23 = this.n23

                this.n00 =-m12*m21+ m11*m22;
                this.n01 = m02*m21- m01*m22;
                this.n02 =  -m02*m11 + m01*m12;
                this.n03 = m03*m12*m21 - m02*m13*m21 - m03*m11*m22 + m01*m13*m22 + m02*m11*m23 - m01*m12*m23;
                this.n10 =  m12*m20 - m10*m22;
                this.n11 = -m02*m20 + m00*m22;
                this.n12 = m02*m10 - m00*m12;
                this.n13 = m02*m13*m20 - m03*m12*m20 + m03*m10*m22 - m00*m13*m22 - m02*m10*m23 + m00*m12*m23;
                this.n20 =-m11*m20+ m10*m21;
                this.n21 =  m01*m20 - m00*m21;
                this.n22 = +m01*m10+ m00*m11;
                this.n23 = m03*m11*m20 - m01*m13*m20 - m03*m10*m21 + m00*m13*m21 + m01*m10*m23 - m00*m11*m23;
                return this.multiScale(1/det)
             
            }else{
                return this.dup().inverse();
            }
        },
        translate:function(x,y,z,restrain){
            return this.multi(M.translate(x,y,z),restrain)
        },
        scale:function(x,y,z,restrain){
            return  this.multi(M.scale(x,y,z),restrain)
        },
        rotateX:function(angle,restrain){
            return  this.multi(M.rotateX(angle),restrain)
        },
        rotateY:function(angle,restrain){
            return  this.multi(M.rotateY(angle),restrain)
        },
        rotateZ:function(angle,restrain){
            return this.multi(M.rotateZ(angle),restrain)
        },
        rotateN:function(rx, ry, rz,restrain){
            return    this.multi(M.rotateN(rx,ry,rz),restrain)
        },
        rotate:function(w,angle,restrain){
            return  this.multi(M.rotate(w,angle),restrain)
        },
        toString: function(){
            return  this.n00 + "," + this.n01 + "," + this.n02 + "," + this.n03 + "\n" +this.n10 + "," + this.n11 + "," + this.n12 + "," + this.n13 + "\n" +  this.n20 + "," + this.n21 + "," + this.n22 + "," + this.n23;
        }
    })
    var changeMin=function(v){
        var min=Math.min(v.x, Math.min(v.y, v.z))
        var flag= min==v.x?'x':(min==v.y?'y':'z');
        
        v[flag]=1;
        return v;
    }
    Klass.mixin(Matrix,{
        create:function(obj){
            return new Matrix(obj);
        },
        translate:function(x,y,z){
            return new Matrix({
                n03:x,
                n13:y,
                n23:z
            })
        },
        scale:function(x,y,z){
            if(y==null){
                y=x,z=x
            }
            return new Matrix({
                n00:x,
                n11:y,
                n22:z
            })
        },
        rotateX:function(angle){
            var c=Math.cos(angle);
            var s=Math.sin(angle)
            return new Matrix({
                n11:c,
                n12: -s,
                n21:s,
                n22:c
            })
        },
        rotateY:function(angle){
            var c=Math.cos(angle);
            var s=Math.sin(angle)
            return new Matrix({
                n00:c,
                n02: s,
                n20:-s,
                n22:c
            })
        },
        rotateZ:function(angle){
            var c=Math.cos(angle);
            var s=Math.sin(angle)
            return new Matrix({
                n00:c,
                n01: -s,
                n10:s,
                n11:c
            })
        },
        // 一次旋转多个角度
        rotateN:function(rx, ry, rz){
            var sx, sy, sz;
            var cx, cy, cz;
            sx = Math.sin(rx);
            sy = Math.sin(ry);
            sz = Math.sin(rz);
            cx = Math.cos(rx);
            cy = Math.cos(ry);
            cz = Math.cos(rz);
            var rot = new Matrix();
            rot.n00 = cy*cz;
            rot.n01 = -cy * sz;
            rot.n02 = sy;
            rot.n10 = cx * sz + sx * sy * cz;
            rot.n11 = -sx*sy*sz+cx*cz;
            rot.n12 = -sx*cy;
            rot.n20 = sx * sz - cx * sy * cz;
            rot.n21 = sx * cz + cx * sy * sz;
            rot.n22 = cx * cy;
        
            return rot;
        },
        //沿任意轴的旋转首先分解出正交矩阵m [u,v,w] X m [u,v,w]T(因为是w作为Z轴,所以w必须放在第三个变量)
        //首先 左乘 [u,v,w]T 转换到 uvw正交基坐标系 然后作Z轴旋转（W与绕的轴重合）再返回原坐标系
        // w*u=v u*w=-v  v*w=u w*v=-u  所以changeMin({x:w.x,y:w.y,z:w.z} 取代的位置相当于是v的位置
        rotate:function(w,angle){
            var m=Matrix.rotateZ(angle);
          
            w=Vector.create(w).normalize();
            var v=w.cross(changeMin({
                x:w.x,
                y:w.y,
                z:w.z
            })).normalize();
                
            var u=v.cross(w);
            var l=Matrix.create({
                n00:u.x,
                n01:v.x,
                n02:w.x,
                n10:u.y,
                n11:v.y,
                n12:w.y,
                n20:u.z,
                n21:v.z,
                n22:w.z
            })
            var r=Matrix.create({
                n00:u.x,
                n01:u.y,
                n02:u.z,
                n10:v.x,
                n11:v.y,
                n12:v.z,
                n20:w.x,
                n21:w.y,
                n22:w.z
            })
            return r.multi(m).multi(l);
        }
    })

    /*矩阵计算的相关类暂时结束*/
    
    //直线 由于多条曲线以及直接链接来而
    var Line=Klass.create({
        type:'line',
        initialize:function(obj ){
            this.lineWidth=obj.lineWidth||1;
            this.points=obj.points;
            //[[3,4,5],2,[0,1]]
            //step以[[3,4,5],2,[0,1]]的形式. 3即代表 points中的points[3]可以是数字（代表直线）二元数组代表
            //二次贝塞尔   三元则为三次贝塞尔
            this.steps=obj.steps;
            this.staticWidth=obj.staticWidth||false;
            this.strokeColor=obj.strokeColor||[33,33,33,1];
        },
        dup:function(){
            return new Line(this)
        } ,
        inject:function(parentNode){
            parentNode.append(this);
            return this;
        }
    })
    /*作为投影面以及其他平面的基类   未完成*/
    var Plane=Klass.create({
        type:'plane',
        initialize:function(obj){
            this.transform=obj.transform;
            this.stand_point=obj.stand_point;
            this.normal=obj.normal||new Vector([0,0,1])
        }
    })

    //相当于是全局坐标系的 parentNode 也可以视为是一个Scene
    var Camera=Klass.create({
        type:'camera',
        initialize:function(obj){
            if(!obj) obj={};
            this.transform=obj.transform||new Matrix({
                n23:-30
            });
            this.focus=obj.focus||3;
        }
    })
    //只有无旋转的运动 有位移 可以与环境碰撞,但是自身无碰撞,有生命周期
    //可以有父节点不能有自己的子节点
    var Particle=Klass.create(Vector,{
        type: 'particle',
        initialize:function(obj,opts){
            opts=opts||{};
            Vector.prototype.set.call(this,obj);
            this.setOptions(opts);
        },
        setOptions:function(opts){
            if(opts.parentNode){
                this.inject(opts.parent)
            }
            this.radius=opts.radius||.2;
            this.fillColor=opts.fillColor||[23,23,23,1];
            this.strokeColor=opts.strokeColor;
            this.touch=opts.touch||false;
            this.link=null;
        },
        inject:function(parentNode){
            parentNode.append(this);
            return this;
        },
        dup:function(){
            return new Particle(this,this);
        },
        
        getCenter:function(){
            return new Vector(this);
        },
        //与某个顶点做连接使得改变时可以带动其连接点做一并的矩阵变幻
        linkTo:function(verticle){
            this.link=verticle
        }

    });
    var Face=Klass.create({
      
        type:'face',
        initialize:function(obj){
            this.verticles=obj.verticles||[];
            this.refrect=obj.refrect||[];
            this.fillColor=obj.fillColor;
            this.strokeColor=obj.strokeColor;
            this.fill=obj.fill||true;
        },
        set:function(obj){
            this.verticles=obj.verticles||this.verticles;
            this.refrect=obj.refrect||this.refrect;

        },
        linkTo:function(vectors){
            if(!this.refrect) return null ;
            for(var i=0,l=this.refrect.length;i<l;i++){
                this.verticles[i]=vectors[this.refrect[i]];
            }
            return this;
        },
        isTriangle:function(){
            return this.verticles.length==3||this.refrect.length==3;
        },
        getCenter:function(){
            var vs=this.verticles;
            return  Vector.average(vs);
        },
        //注意p1,p2,p3应该绕着P0P1沿着右手坐标系的正方向
        getVertical:function(){
            var vs=this.verticles;
            return vs[1].sub(vs[0],true).cross(vs[2].sub(vs[0],true))
        }
    /*如果形状改变,重新计算中心以及*/
     
    })
    /*场景类,他的子节点可以是Shape也可以是另外一个Scene
     *衍生出这个类是为了控制变行(transform)
     **/
    var Scene=Klass.create({
        type:'scene',
        initialize:function(obj){
            this.transform=obj.transform||Matrix.create();
            this.childNodes=obj.childNodes||[];
            if(this.hasChild()){
                for(var i=0,l=this.childNodes.length;i<l;i++){
                    this.childNodes[i].parentNode=this;
                }
            }
            if(obj.parentNode){
                this.inject(obj.parentNode)
            }
           
        },
        trans:function(M){
            this.transform.multi(M);
            return this;
        },
        append:function(child){
            this.childNodes.push(child);
            child.parentNode=this;
        },
        inject:function(parentNode){
            parentNode.append(this);
            return this;
        },
        hasChild:function(){
            return this.childNodes.length>0;
        },
        hasParent:function(){
            return def(this.parentNode);
        },
        getCurrentTransform:function(){
            var tmp=this;
            var result=tmp.transform.dup();
            while(tmp.hasParent()){
                result.multi(tmp.parentNode.transform);
                
                tmp=tmp.parentNode;
            }
            return result;
        }
    })

    /*Shape类继承与Scene （由于是精简版的Klass,所以..调用父类构造函数不太雅观）*/
    //仅指代于多面体构(圆也可以由多面体fake而来),
    var Shape=Klass.create(Scene,{
        /*
         *可添加
         *draw_back
         *onClick
         *其他事件原理类似 陆续会添加添加
         **/
        type:'shape',
        initialize:function(obj){
            /*调用父类构造函数*/
            Scene.prototype.initialize.call(this,obj);
            this.set(obj);
           
            var vs=this.verticles;
            for(var i=0,l=vs.length;i<l;i++){
                if(Klass.type(vs[i])!=='vector'){
                    vs[i]=new Vector(vs[i])
                }
            }
            this.link();
        },
        //过滤 type 暂时可以是'unFill','fill''
        filter:function(array,type,bool){
            var fs=this.faces;
            for(var i=0,l=array.length;i<l;i++){
                fs[array[i]][type]=bool;
            }
        },

        link:function(){
            var fs=this.faces;
            var vs=this.verticles;
            for(var i=0,l=fs.length;i<l;i++){
                fs[i].linkTo(vs);
            }
        },
        set:function(obj){
            this.fillColor=obj.fillColor;
            this.strokeColor=obj.strokeColor;
            this.verticles=obj.verticles||this.vertices;
            this.faces=obj.faces||this.faces;
        }
    })

   

   
    //基类代表如太阳一般的平行光源，代表光线 来源方向的向量
    //由于机能以及算法的问题 采用最简单的光线投影算法
    var Light=Klass.create(Vector,{
        type:'light',
        initialize:function(obj){
            obj=obj||[0,0,1];
            this.set(obj);

            this.regular=obj.regular||false
            this.normalize();
        },

        dup:function(){
            var tmp= new Light(this);
            tmp.regular=this.regular||false;
            return tmp;
        },
        getIntensity:function(v){
            var tmp;
            tmp=this.dot(v.normalize());
            return tmp>0?tmp:-tmp;
        }
    })
    var Render=Klass.create({
        type:'render',
        initialize:function(obj){
            //并不单指canvas ,也可以是一个dom容器节点
            this.canvas=obj.canvas;
             
            this.camera=obj.camera||new Camera();
           
        },
        parseP:function(p){
            var scale=this.height/2;
            var v = this.camera.focus/(-p.z);
           
            return  {
                x: p.x * v * scale + this.width/2,
                y: p.y * v * -scale + scale
            }
        },
        parsePs:function(ps){
            var tmp=[];
            for(var i=0,l=ps.length;i<l;i++){
                tmp.push(this.parseP(ps[i]))
            }
            return tmp;
        },
        parseParticle:function(pa){
            var scale=this.height/2;
            var v = this.camera.focus/(-pa.z);
            return {
                x: pa.x * v * scale + this.width/2,
                y: pa.y * v * -scale + scale,
                radius: v*pa.radius*scale
            }
        },
        /*渲染接口*/
        render:function(){
        }
    })

    /*到目前为止,所作的一切都是与canvas标签无关,引入第一个针对于canvas标签的render*/
    //处理一个节点集的3D->2D在fill时出现的Gap问题
    function elimGap(arr){
        for(var i=0,l=arr.length;i<l;i++){
            var end=(i+1)%l,dx=arr[end].x-arr[i].x,dy=arr[end].y-arr[i].y;
            var ds=Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2))*3;
            arr[end].x+=(dx)/ds;
            arr[end].y+=(dy)/ds;
            arr[i].x-=(dx)/ds;
            arr[i].y-=(dy)/ds;
        }
    }
  
    function pInFace3(p,a,b,c){


        var v0 = c.sub(a,true)
        var v1 = b.sub(a,true)
        var v2 = p.sub(a,true)

        var dot00 = v0.dot(v0);
        var dot01 =v0.dot(v1);
        var  dot02 = v0.dot(v2)
        var dot11 = v1.dot(v1)
        var dot12 = v1.dot(v2)

        var invDenom = 1 / (dot00 * dot11 - dot01 * dot01)
        var u = (dot11 * dot02 - dot01 * dot12) * invDenom
        var v = (dot00 * dot12 - dot01 * dot02) * invDenom

        return (u > 0) && (v > 0) && (u + v < 1)

    }
    function pInFace(p,face){
        var vs=face.verticles;
        for(var i=0,l=vs.length-2;i<l;i++){
            if(pInFace3(p,vs[0],vs[i+1],vs[i+2])){
                return true;
            }
        }
        return false;
    }
    function pInParticle(p,particle){
        return  p.sub(particle,true).modulo()<particle.radius;
    }
    function zSorter(x, y) {
        return x.center.z - y.center.z;
    }
    function antizSorter(y, x) {
        return x.center.z - y.center.z;
    }
    function getOffset(node){
        var l=node.offsetLeft;
        var t=node.offsetTop;
        while(node.offsetParent){
            node=node.offsetParent;
            l+=node.offsetLeft;
            t+=node.offsetTop;
        }
        return {
            left:l,
            top:t
        };
    }
    function  antiFitting(line){
    //假如不是曲线
       
    }
    var CRender=Klass.create(Render,{
        type:'crender',
        initialize:function(obj){
            Render.prototype.initialize.call(this,obj);
            //不指定则无光照
            this.ligtht=obj.ligtht||null;
            //阴影投射平面 ,不指定则不作投影
            this.sPlane=obj.sPlane||null;
            this.parse_points=[];
            this.ctx=this.canvas.getContext('2d');
            this.ctx.lineCap='round';
            this.ctx.lineWidth=.5;
            this.ctx.lineJoin='round';
            var offset=getOffset(this.canvas);
            var height=this.height=this.canvas.height;
            this.scale=this.height/2
            this.width=this.canvas.width;
            this.origin={
                x:offset.left+this.width/2,
                y:offset.top+this.height/2
            };
            //将每个步骤暂时存储,由未解析的shape 以及line Particle等组成
            this.step=[];
            //一个parsed_buffer由若干个parsed组成,避免不必要的重复解析
            this.parsed_buffer=[];
            //一个parsed由 若干个被解析的face(由shape分解而来)以及line以及particle组成
            
            this.parsed=[];
            //放入Particle 或者是Shape
            this.listenObjects={
                click:[]
            /*
                 *下次更新的重点就是添加其他事件支持,
                 *原理是一样的 就是代码量
                 **/
            }
            var that=this;
            this.canvas.addEventListener('click',function(e){
                var offsetX=e.clientX-that.origin.x;
                var offsetY=that.origin.y-e.clientY;
                var objs=that.listenObjects.click;
                if(objs.length==0) return;
                objs.sort(antizSorter);
                for(var k=0,l=objs.length;k<l;k++){
                    var item=objs[k]
                    if(item.type=='parsed_face'){
                        var face_vs=item.face.verticles
                        var normal=item.face.getVertical();
                        var v=V.create([0,0,normal.dot(face_vs[0])])
                        var n02=offsetX*2/(that.camera.focus*height),
                        n12=offsetY*2/(that.camera.focus*height),
                        n20=normal.x,n21=normal.y,n22=normal.z;
                        var m=M.create({
                            n02:n02,
                            n12:n12,
                            n20:n20,
                            n21:n21,
                            n22:n22
                        })
                        var v_r=m.inverse().transform(v);
                        if(pInFace(v_r,item.face)){
                            item.shape.onClick.call(item.shape,item.o_f,v_r);
                            return;
                        }
                    }else{
                    
                }
                }
            },false)

        },
        clearParsed:function(){
            this.parsed=[];
        },
        retriveParsed:function(){
            return this.parsed_buffer
        },
        storeParsed:function(){
            
        },
        push:function(item){
            this.step.push(item);
        },
        resolveShape:function(shape,inject){
            var callback=shape.draw_callback;
            var draw_back=shape.draw_back;
            var t=shape.getCurrentTransform().multi(this.camera.transform);
            var tn=t.removeOffset(true);
            var faces=shape.faces;
            var vs=shape.verticles;
            var w_vs=t.transforms(vs,true);
            var light=this.light||null;
            if(light&&light.regular){
                light=light.transform(this.camera.transform.removeOffset(true),true);
            }
            var result=[];
            for(var i=0,l=faces.length;i<l;i++){
                
                var f=faces[i];
                var r=f.refrect;
                if ((!f.fill)||(callback != null && callback.call(this,f, i, shape) === true))
                    continue;
                var f_center =t.transform(f.getCenter(),true);
                if(f_center.z>-1) continue;
                var n1=tn.transform(f.getVertical(),true);
                if (draw_back !== true &&
                    n1.dot(f_center)> 0) {
                    continue;
                }
                var intensity=light?light.getIntensity(n1):1;
                var w_f=new Face({
                    refrect:r
                }).linkTo(w_vs);
              
                result.push({
                    o_f:f,
                    type:'parsed_face',
                    shape:shape,
                    face:w_f,
                    intensity:intensity,
                    fillColor: f.fillColor||shape.fillColor,
                    strokeColor: f.strokeColor||shape.strokeColor,
                    center:f_center,
                    callback:shape.draw_callback
                })
            }
            if(shape.onClick)  
                this.listenObjects.click= this.listenObjects.click.concat(result)
            if(inject) this.parsed=this.parsed.concat(result)
            return result
        },
        resolveShapes:function(shapes,inject){
             
            var result=[];
            for(var i=0,l=shapes.length;i<l;i++){
                result= result.concat(this.resolveShape(shapes[i],inject))

            }
          
            return result;
        },
        resolveParticle:function(particle,inject){
            var t=particle.parentNode?particle.parentNode.getCurrentTransform().multi(this.camera.transform):this.camera.transform;
            var w_p=t.transform(particle,true);
            var result={
                particle:particle,
                type:'parsed_particle',
                w_p:w_p,
                fillColor: particle.fillColor,
                strokeColor:particle.strokeColor,
                center:w_p
            }
            if(inject) this.parsed.push(result)
            return result;
        },
        resolveLine:function(line){
            var t=line.parentNode?line.parentNode.getCurrentTransform().multi(this.camera.transform):this.camera.transform;
            var w_p=t.transforms(line.points,true);
            var w_l=new Line(line);
            w_l.points=w_p;
            w_l.center=w_l.points[0];
            return w_l;
        },
      
        resolves:function(items,inject){
            var result=[];
            for(var i=0,l=items.length;i<l;i++){
                switch(Klass.type(items[i])){
                    case 'shape':
                        result=result.concat(this.resolveShape(items[i]))
                        break;
                    case 'particle':
                        result.push(this.resolveParticle(items[i]))
                        break;
                }
            }
            if(inject) this.parsed=this.parsed.concat(result)
            return result;
        },
        drawParticle:function(resolved_particle){
            if(Klass.type(resolved_particle)=='particle'){
                resolved_particle=this.resolveParticle(resolved_particle)
            }

            var ctx=this.ctx;
            var w_p=resolved_particle.w_p;
            w_p=this.parseParticle(w_p)
            ctx.beginPath();
            ctx.arc(w_p.x,w_p.y,w_p.radius,0,Math.PI*2,true);
            if(resolved_particle.fillColor){
                this.setFillStyle(resolved_particle.fillColor);
                ctx.fill();
            }
          
            if(resolved_particle.strokeColor){
                ctx.closePath();
                this.setStrokeStyle(resolved_particle.strokeColor);
                ctx.stroke();
            }

        },
        //传入解析过后的形状
        drawFace:function(resolved_face){
            var ctx=this.ctx;
            var face=resolved_face.face;
            ctx.beginPath();
            var parsePs=[];
            for(var j=0,ll=face.verticles.length;j<ll;j++){
                parsePs.push(this.parseP(face.verticles[j]));
            }
            elimGap(parsePs);
            ctx.moveTo(parsePs[0].x,parsePs[0].y);
            for(var i=0;i<ll;i++){
                ctx.lineTo(parsePs[i].x,parsePs[i].y);
            }
            if(resolved_face.fillColor){
                var fc=resolved_face.fillColor;
                var k=resolved_face.intensity;
                this.setFillStyle( $a2c([fc[0]*k,fc[1]*k,fc[2]*k,fc[3]]))
                ctx.fill();
            }
            if(resolved_face.strokeColor){
                ctx.closePath();
                this.setStrokeStyle(resolved_face.strokeColor)
                ctx.stroke();
            }
        },
        drawShape:function(faces){
            if(Klass.type(faces)=='shape')
                faces=this.resolveShape(faces);
            faces.sort(zSorter);
            for(var i=0,l=faces.length;i<l;i++){
                var obj=faces[i];
                this.drawFace(obj);
            }
        },
        //画一条线, path_mode即是否画轨迹化后的线
        drawLine : function(resolved_line,path_mode){
            if(Klass.type(resolved_line)==='line'){
                resolved_line=this.resolveLine(resolved_line)
            }
            var ctx=this.ctx;
            var ps=this.parsePs(resolved_line.points)
            var steps=resolved_line.steps;
            ctx.beginPath();
            ctx.moveTo(ps[steps[0]].x,ps[steps[0]].y)
            for(var i=1,l=steps.length;i<l;i++){
                if(!steps[i].length){
                    ctx.lineTo(ps[steps[i]].x,ps[steps[i]].y)
                }else{
                    if(steps[i].length==2){
                        ctx.quadraticCurveTo(ps[steps[i][0]].x,ps[steps[i][0]].y, ps[steps[i][1]].x,ps[steps[i][1]].y)
                    }else{
                        ctx.bezierCurveTo(ps[steps[i][0]].x,ps[steps[i][0]].y, ps[steps[i][1]].x,ps[steps[i][1]].y,ps[steps[i][2]].x,ps[steps[i][2]].y)
                    }
                }
            }
            ctx.lineWidth=resolved_line.lineWidth;
            this.setStrokeStyle(resolved_line.strokeColor)
            ctx.stroke();
        },
        draw:function(items){
            if(!items) items=this.parsed.length? this.parsed: this.resolves(this.step);
            items.sort(zSorter);
            for(var i=0,l=items.length;i<l;i++){
                switch(Klass.type(items[i])){
                    case 'parsed_face':
                        this.drawFace(items[i])
                        break;
                    case 'parsed_particle':
                        this.drawParticle(items[i])
                        break;
                }
            }
        },
        render:function(items){
            this.listenObjects={
                click:[]
            /*
                 *下次更新的重点就是添加其他事件支持,
                 *原理是一样的 就是代码量
                 **/
            }
            this.draw(items)
        },
        drawBackground:function(){
            this.ctx.fillRect(0,0,this.width,this.height);
        },
        clear:function(){
            this.listenObjects={
                click:[]
            /*
                 *下次更新的重点就是添加其他事件支持,
                 *原理是一样的 就是代码量
                 **/
            }
            this.ctx.clearRect(0,0,this.width,this.height)
        },
        setFillStyle:function(obj){
            if(!(obj instanceof Array)){
                this.ctx.fillStyle=obj;
            }else{
                this.ctx.fillStyle=$a2c(obj);
            }
        },
        setStrokeStyle:function(obj,style){
            if(!(obj instanceof Array)){
                this.ctx.strokeStyle=obj;
            }else{
                this.ctx.strokeStyle=$a2c(obj);
            }
            if(style){
                this.ctx.lineWidth=style.lineWidth||1;
                this.ctx.lineCap=style.lineCap||'round';
                this.ctx.lineJoin=style.lineJoin||'round';
            }
        },
        //可以是shape或者Particle
        register:function(item,type,callBack){
            this.listenObjects[type].push(item);
        },
        //接受一个数组的item或者一个scene中的所有子节点(不继续向下递归)
        registerScene:function(scene,type){
            if(scene instanceof Array){
                for(var i,l=scene.length;i<l;i++){
                    this.register(scene[i],type);
                }
            }else{
                this.registerScene(scene.childNodes,type);
            }
        }
    })
    /*暴露的类*/
    Klass.mixin(m3d,{
        Vector:Vector,
        Matrix:Matrix,
        Face:Face,
        Scene:Scene,
        Shape:Shape,
        Camera:Camera,
        Particle:Particle,
        Light:Light,
        Render:Render,
        CRender:CRender,
        Plane:Plane,
        Line:Line
    })
})()
