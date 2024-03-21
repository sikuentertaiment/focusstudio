const app = {
	body:find('body'),
	header:find('#header'),
	content:find('#content'),
	pages:['home','contacts'],
	details:find('#details'),
	loading:find('#loading'),
	async init(){
		this.initFirebase();
		this.pages.forEach(page=>{
			this[page] = this.content.addChild(this[page]());
		})
		this.initNav();
		this.opencontacts();
	},
	home(){
		return makeElement('div',{
			style:`
				background:black;
				width:100%;
				height:${innerHeight}px;
				display:flex;
				align-items:center;
				justify-content:center;
				flex-direction:column;
			`,
			innerHTML:`
				<div style="
	        color:white;
	        font-weight: bold;
	        font-size:18px;
	      ">FF Studio: The Right Place To Make It Worth Again!</div>
	      <div style="color:white;font-size: 16px;padding:10px;">Jasa service kamera terbaik dibengkulu</div>
	      <div style="
	        padding:20px 0;
	        flex-direction: row;
	        display: flex;
	        gap:10px;
	      ">
	        
	      </div>
			`,
			onadded(){
				// this.find('#submitbutton').onclick = ()=>{
				// 	this.collectData();
				// }
			},
			collectData(){
				app.loading.show('flex');
				const resiId = this.find('input').value;
				if(resiId.length < 1){
					app.loading.hide();
					return alert('Nomor Resi Tidak Valid!');
				}
				app.showDetails(resiId);
			}
		})
	},
	contacts(){
		console.log('called');
		return makeElement('div',{
			style:`
				background:black;
				width:100%;
				height:${innerHeight}px;
				display:flex;
				align-items:center;
				justify-content:center;
				flex-direction:column;
				color:white;
			`,
			innerHTML:`
		    <div style=width:100%;height:100%; id=bg>
		      <img src=./more/media/goodbg.png style="width:100%;height:100%;object-fit: cover;" id=bgimg>
		    </div>
		    <div style=width:100%;display:flex;justify-content:center;flex-direction:column;align-items:center;position:fixed;top:0;height:100%;gap:64px;>
		    	<div style="
		    		display:flex;
		    		flex-direction:column;
		    		gap:20px;
		    		align-items:center;
		    	">
						<div style="width:96px;height:96px;border-radius:50%;overflow:hidden;border:2px solid #222222;">
							<img src=./more/media/supermanprofile.png style="width:100%;height:100%;object-fit:cover;" id=profilepic>
						</div>
						<div style="font-size:24px;" id=headertitle>-</div>
					</div>
		      <div style="
		        padding:32px 0;
		        flex-direction: row;
		        display: flex;
		        gap:20px;
		        flex-direction:column;
		      " id=ssmbuttons>
		      </div>
		      <div style="
		      	height: 64px;
				    display: flex;
				    align-items: flex-end;
				    color: #454545;
				    font-size: 12px;
		      ">&copy FFSTUDIO. AlrightReserved.</div>
		    </div>
			`,
			async onadded(){
				this.webdata = (await firebase.database().ref('/websettings').get()).val();
				this.find('#headertitle').innerText = this.webdata.headertitle;
				find('title').innerText = this.webdata.webtitle;
				const bg = this.find('#bg');
				if(this.webdata.usebackground === '0'){
					bg.hide();
				}else{
					const bgimg = this.find('#bgimg');
					bgimg.src = this.webdata.backgroundpic;
					bgimg.onerror = ()=>{
						bg.hide();
					}
				}

				const profilepic = this.find('#profilepic');
				profilepic.src = this.webdata.profilepic;
				profilepic.onerror = ()=>{
					profilepic.hide();
				}

				this.generateContacts();
				this.find('#submitbutton').onclick = ()=>{
					this.collectData();
				}
				app.loading.hide();
			},
			collectData(){
				app.loading.show('flex');
				const resiId = this.find('input').value;
				if(resiId.length < 1){
					return setTimeout(()=>{
						app.loading.hide();
						alert('Nomor Resi Tidak Valid!');
					},1000);
				}
				app.showDetails(resiId);
			},
			generateContacts(){
				const data = {
					fb:null,
					wa:null,
					map:null
				}

				this.find('#ssmbuttons').addChild(makeElement('div',{
						style:`
			        flex-direction: row;
			        display: flex;
			        gap:10px;
			        margin-bottom:8px;
						`,
						innerHTML:`
							<input placeholder="Masukan No Resi Servis Anda..." style="width:100%;border:2px solid #222222;">
			        <div style="
			          padding:20px;
			          background:#222222;
			          border-radius:5px;
			          cursor:pointer;
			          color:white;
			          border:2px solid #222222;
			          white-space:nowrap;
			          font-size:12px;
			        " id=submitbutton>Cek Pesanan</div>
						`
				}))


				for(let i in data){
					this.find('#ssmbuttons').addChild(makeElement('div',{
						style:`
							display:flex;
	        		align-items:center;
	        		justify-content:center;
	        		gap:20px;
	        		font-size:14px;
	        		position:relative;
						`,className:'item',
						webdata:this.webdata,
						innerHTML:`
							<div style=display:flex;align-items:center;position:absolute;left:15px;>
		        		<img src=./more/media/${i}.png style=width:32px;height:32px;>
		        	</div>
		        	<div>${this.webdata[`${i}_label`]}</div>
						`,
						onclick(){
							window.open(this.webdata[`${i}_link`],'_blank');
						}
					}))
				}
			}
		})
	},
	about(){
		return makeElement('div',{
			style:`
				background:black;
				width:100%;
				height:${innerHeight}px;
				display:flex;
				align-items:center;
				justify-content:center;
				flex-direction:column;
				color:white;
			`,
			innerHTML:`
				<div style="
	        font-weight: bold;
	        font-size:18px;
	        width:500px;
	      ">
	      	FfStudio adalah tempat service kamera terbaik dibengkulu.
	      	Memberikan berdiri sejak 2022, FfStudio telah banyak melayani customer dengan kendala yang beragam
	      	mulai dari kerusakan ringan hingga parah sekalipun.
	      </div>
			`
		})
	},
	room:'home',
	initNav(){
		findall('#nav div').forEach(div=>{
			if(!this.activeNav){
				this.activeNav = div;
				this.activeNav.classList.add('activeNav');
			}
			div.onclick = ()=>{
				this[`open${div.id}`]();
				div.classList.add('activeNav');
				this.activeNav.classList.remove('activeNav');
				this.activeNav = div;
			}
		})
	},
	openhome(){
		this.home.scrollIntoView({behavior:'smooth'});
		this.room = 'home';
	},
	opencontacts(){
		this.contacts.scrollIntoView({behavior:'smooth'});
		this.room = 'contacts';
	},
	openabout(){
		this.about.scrollIntoView({behavior:'smooth'});
		this.room = 'contacts';
	},
	async showDetails(ResiId){

		let data = await firebase.database().ref(`/orders/${ResiId}`).get();
		data = data.val();

		this.loading.hide();

		if(!data){
			return alert('Data tidak ditemukan, mohon periksa kembali Nomor Resi Anda!');
		}

		this.details.clear();
		this.details.addChild(makeElement('div',{
			innerHTML:`
				<div style="
          padding:24px;
          border-bottom:2px solid #222222;
          position: relative;
        ">
          <div style="font-size:18px;text-align: center;">Informasi Servisan</div>
          <div style="
            position: absolute;
            top:0;right: 0;
            padding:20px;
          ">
            <img src=./more/media/close.png.png style="
              width:24px;
              height:24px;
              cursor: pointer;
              background:white;
              border-radius:5px;
            " id=backbutton>
          </div>
        </div>
        <div style="
          padding:24px;
          overflow: auto;
          height: 100%;
        ">
          <div style=margin-bottom:15px;>
            <div>Nomor Resi</div>
            <div style=display:flex;margin-top:10px;>
              <input value='${data.resi}' readonly>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Tanggal</div>
            <div style=display:flex;margin-top:10px;>
              <input value='-' readonly id=datetime>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Nama Pelanggan</div>
            <div style=display:flex;margin-top:10px;>
              <input value='${data.name}' readonly>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Alamat Pelanggan</div>
            <div style=display:flex;margin-top:10px;>
              <input value='${data.address}' readonly>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Kontak Pelanggan</div>
            <div style=display:flex;margin-top:10px;>
              <input value='${data.number}' readonly type=number>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Jenis Jasa</div>
            <div style=display:flex;margin-top:10px;>
              <input value='${data.typeservices}' readonly>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Jenis Barang</div>
            <div style=display:flex;margin-top:10px;>
              <input value='${data.typestuff}' readonly>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Model Barang</div>
            <div style=display:flex;margin-top:10px;>
              <input value='${data.modelstuff}' readonly>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Kerusakan</div>
            <div style=display:flex;margin-top:10px;>
              <input value='${data.problem}' readonly>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Status</div>
            <div style=display:flex;margin-top:10px;>
              <input value='${data.status === '0' ? 'Dalam Antrian' : data.status === '1' ? 'Diproses' : 'Selesai'}' readonly>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Deskripsi Kerusakan</div>
            <div style=display:flex;margin-top:10px;>
              <textarea readonly>${data.problemdes}</textarea>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Deskripsi Penanganan</div>
            <div style=display:flex;margin-top:10px;>
              <textarea readonly>${data.handledes}</textarea>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Biaya Total</div>
            <div style=display:flex;margin-top:10px;>
              <input value='${data.fullprice}' readonly>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Status Pembayaran</div>
            <div style=display:flex;margin-top:10px;>
              <input value='${data.paystatus === '0' ? 'Belum Lunas' :'Lunas'}' readonly>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Foto Dokumentasi</div>
            <div style=display:flex;margin-top:10px;gap:10px;overflow:auto; id=photoParent>
            </div>
          </div>
        </div>
			`,
			onadded(){
				this.photoParent = this.find('#photoParent');
				this.find('#backbutton').onclick = ()=>{
					app.details.hide();
				}//show included foto
				this.showIncludedFoto();

				this.handleDateTime();
			},
			handleDateTime(){
				const ts = data.resi.slice(4);
    		const currentDateTime = new Date(Number(ts));
				const year = currentDateTime.getFullYear();
				const month = currentDateTime.getMonth() + 1; // Note: January is 0
				const day = currentDateTime.getDate();
				const hours = currentDateTime.getHours();
				const minutes = currentDateTime.getMinutes();
				const seconds = currentDateTime.getSeconds();
				this.find('#datetime').value = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
			},
			showIncludedFoto(){
				if(!data.files)
					return this.photoParent.addChild(makeElement('div',{
						innerHTML:`
							Tidak ada foto Dokumentasi.
						`
					}));
				for(let i=0;i<data.files.length;i++){
					const src = data.files[i];
					this.photoParent.addChild(makeElement('div',{
						style:`
							width:200px;
              height: 200px;
              background:#0000005e;
              border:1px solid gainsboro;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor:pointer;
              position:static;
						`,
						onadded(){
							this.find('img').onclick = ()=>{
								if(!this.isFull)
									return this.openFullScreen();
								this.style = `
									width:200px;
		              height: 200px;
		              background:#0000005e;
		              border:1px solid gainsboro;
		              border-radius: 10px;
		              display: flex;
		              align-items: center;
		              justify-content: center;
		              cursor:pointer;
		              position:static;
								`;
								this.isFull = false;
							}
						},
						innerHTML:`
							<img src="${src}" style="max-width:100%;max-height:100%;object-fit:cover;">
						`,
						openFullScreen(){
							this.style.position = 'fixed';
							this.style.top = '0';
							this.style.left = '0';
							this.style.width = '100%';
							this.style.height = '100%';
							this.style.borderRadius = '0px';
							this.isFull = true;
						}
					}))
				}
			},
			style:`
				background: black;
		    border-radius: 8px;
		    display: flex;
		    height: 90%;
		    flex-direction: column;
		    overflow: hidden;
		    border: 1px solid #222222;
		    color: white;
			`,
			className:'boxwhitewidth'
		}))
		this.details.show('flex');
	},
	initFirebase(){
		firebase.initializeApp({
	    apiKey: "AIzaSyCx0lPgs2J_leKBI8fVmfJHgOlfBR5eRMY",
		  authDomain: "blicochat.firebaseapp.com",
		  databaseURL: "https://blicochat-default-rtdb.asia-southeast1.firebasedatabase.app",
		  projectId: "blicochat",
		  storageBucket: "blicochat.appspot.com",
		  messagingSenderId: "318425093561",
		  appId: "1:318425093561:web:91d2013752af4b58231268"
		});
	}
}

app.init();
