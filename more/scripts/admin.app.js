const app = {
	dashboard:find('#dashboard'),
	topLayer:find('#toplayer'),
	showDashBoard(param){
		const OrderBarChart = makeElement('div',{
			innerHTML:`
				<div style=margin-bottom:5px;>
					# Grafik Pemesanan
				</div>
				<div style=margin-bottom:20px;>
					<select>
						<option>Sebulan Terakhir</option>
						<option>Seminggu Terakhir</option>
					</select>
				</div>
				<canvas></canvas>
			`,
			async onadded(){

				let data = await firebase.database().ref('/orders').get();
				data = data.val();


				//option sebulan terakhir

				const labels = {};
				for(let i in data){
					const ts = data[i].resi.slice(4);
					const date = new Date(Number(ts)).toLocaleDateString();
					const tsd = Date.parse(date);
					const now = new Date().getTime();
					const timelessmonth = now - (3600000 * 24 * 30);
					if(tsd > timelessmonth){
						labels[date] = {count:0};
					}
				}

				for(let i in data){
					const ts = data[i].resi.slice(4);
					const date = new Date(Number(ts)).toLocaleDateString();
					if(labels[date]){
						labels[date].count += 1;
					}
				}

				const dataarr = [];

				for(let i in labels){
					dataarr.push(labels[i].count);
				}

				const ctx = this.find('canvas');

			  new Chart(ctx, {
			    type: 'line',
			    data: {
			      labels: Object.keys(labels),
			      datasets: [{
			        label: 'Pemesanan',
			        data: dataarr,
			        borderWidth: 2
			      }]
			    },
			    options: {
			      scales: {
			        y: {
			          beginAtZero: true
			        }
			      }
			    }
			  });
			}
		})
		this.dashboard.addChild(OrderBarChart);
	},
	showTables(){
		const tables = makeElement('div',{
			style:'font-family:calibri',
			innerHTML:`
				<table id="myTable" class="display">
			    <thead>
			        <tr>
			            <th>No</th>
			            <th>Nomor Resi</th>
			            <th>Tanggal</th>
			            <th>Nama Pelanggan</th>
			            <th>Alamat Pelanggan</th>
			            <th>Kontak Pelanggan</th>
			            <th>Tipe Jasa</th>
			            <th>Jenis Barang</th>
			            <th>Tipe Barang</th>
			            <th>Kerusakan</th>
			            <th>Status</th>
			            <th>Deskripsi Kerusakan</th>
			            <th>Deskripsi Penanganan</th>
			            <th>Biaya Total</th>
			            <th>Edit</th>
			            <th>Hapus</th>
			        </tr>
			    </thead>
			    <tbody>
			    </tbody>
			</table>
			`,
			async onadded(){
				let data = await firebase.database().ref('/orders').get();
				data = data.val();
				const dataarr = [];
				let count = 0;
				for(let i in data){
					count += 1;
					data[i].no = count;
					dataarr.push(data[i]);
				}
				let table = new DataTable('#myTable', {
			    responsive: true,
			    lengthChange:false,
			    data:dataarr,
			    columns:[
			    	{data:'no'},
			    	{data:'resi'},
			    	{data:'resi',render(data){
			    		const ts = data.slice(4);
			    		const currentDateTime = new Date(Number(ts));
							const year = currentDateTime.getFullYear();
							const month = currentDateTime.getMonth() + 1; // Note: January is 0
							const day = currentDateTime.getDate();
							const hours = currentDateTime.getHours();
							const minutes = currentDateTime.getMinutes();
							const seconds = currentDateTime.getSeconds();
			    		return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
			    	}},
			    	{data:'name',render(data){
			    		if(data.length < 20)
			    			return data;
			    		return data.slice(0,20)+'...';
			    	}},
			    	{data:'address',render(data){
			    		if(data.length < 20)
			    			return data;
			    		return data.slice(0,20)+'...';
			    	}},
			    	{data:'number'},
			    	{data:'typeservices'},
			    	{data:'typestuff'},
			    	{data:'modelstuff'},
			    	{data:'problem'},
			    	{data:'status',
			    	render(data){
			    		return data==='0' ? 'Dalam Antrian' : data === '1' ? 'Diproses' : 'Selesai';
			    	}},
			    	{data:'problemdes',render(data){
			    		if(data.length < 20)
			    			return data;
			    		return data.slice(0,20)+'...';
			    	}},
			    	{data:'handledes',render(data){
			    		if(data.length < 20)
			    			return data;
			    		return data.slice(0,20)+'...';
			    	}},
			    	{data:'fullprice'},
			    	{data:'resi',render(data){
			    		return `
			    			<div style="
			    				padding:10px;
			    				background:black;
			    				color:white;
			    				border-radius:10px;
			    				cursor:pointer;
			    			" onclick="app.edit('${data}')">Edit</div>
			    		`;
			    	}},
			    	{data:'resi',render(data){
			    		return `
			    			<div style="
			    				padding:10px;
			    				background:red;
			    				color:white;
			    				border-radius:10px;
			    				cursor:pointer;
			    			" onclick="app.delete('${data}')">Hapus</div>
			    		`;
			    	}}
			    ]
				});
			}
		})
		this.dashboard.addChild(tables);
	},
	init(){
		this.initFirebase();
		this.opendashboardnav();
		this.fixHeightDashboard();

		find('#newOrderButton').onclick = ()=>{
			this.newOrder();
		}

		find('#buttonsetting').onclick = ()=>{
			this.openSettings();
		}

		this.initNavButtonsAdmin();
	},
	fixHeightDashboard(){
		this.dashboard.style.maxHeight = `${innerHeight - 260}px`;
	},
	newOrder(){
		this.topLayer.addChild(makeElement('div',{
			style:`
				background:white;
				height:90%;
				border:1px solid gainsboro;
				border-radius:10px;
				display:flex;
				flex-direction:column;
				overflow:hidden;
				position:relative;
			`,
			className:'NewOrderWidth',
			innerHTML:`
				<div style="
					z-index:1;
					position:absolute;
					top:10px;
					background:white;
					width:100%;
					height:100%;
					display:none;
					align-items:center;
					justify-content:center;
					flex-direction:column;
					font-size:16px;
				" id=saveProcessUi>
					<div id=stateLabel style="
						display: flex;
				    flex-direction: column;
				    gap: 20px;
				    justify-content: center;
				    align-items: center;
					">-</div>
				</div>
				<div style="
          padding:24px;
          border-bottom:2px solid gainsboro;
          position: relative;
        ">
        	<div style="
            position: absolute;
            top:0;left: 0;
            padding:20px;
          ">
            <img src=./more/media/back.png style="
              width:24px;
              height:24px;
              cursor: pointer;
            " id=backbutton>
          </div>
          <div style="font-size:18px;text-align: center;">Pesanan Baru</div>
        </div>
        <div style="
          padding:24px;
          overflow: auto;
          height: 100%;
        ">
        	<div style="margin-bottom:20px;position:sticky;top:0;">
        		<div style="
        			padding:20px;
        			background:black;
        			color:white;
        			border-radius:10px;
        			text-align:center;
        			cursor:pointer;
        		" id=saveData>Simpan Pesanan</div>
        	</div>
          <div style=margin-bottom:15px;>
            <div>Nomor Resi</div>
            <div style=display:flex;margin-top:10px;>
              <input id=resi readonly>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Nama Pelanggan</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Nama Pelanggan..." id=name>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Alamat Pelanggan</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Alamat Penanganan..." id=address>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Kontak Pelanggan</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Kontak Pelanggan..." type=number id=number>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Jenis Jasa</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Jenis Jasa..." id=typeservices>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Jenis Barang</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Jenis Barang..." id=typestuff>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Model Barang</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Model Barang..." id=modelstuff>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Kerusakan</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Data Kerusakan..." id=problem>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Status</div>
            <div style=display:flex;margin-top:10px;>
              <select id=status>
              	<option value=0>Dalam Antrian</option>
              	<option value=1>Diproses</option>
              	<option value=2>Selesai</option>
              </select>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Deskripsi Kerusakan</div>
            <div style=display:flex;margin-top:10px;>
              <textarea id=problemdes placeholder="Masukan Deskripsi Kerusakan..."></textarea>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Deskripsi Penanganan</div>
            <div style=display:flex;margin-top:10px;>
              <textarea id=handledes placeholder="Masukan Deskripsi Penanganan..."></textarea>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Biaya Total</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Harga Total..." id=fullprice>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Status Pembayaran</div>
            <div style=display:flex;margin-top:10px;>
              <select id=paystatus>
              	<option value=0>Belum Lunas</option>
              	<option value=1>Lunas</option>
              </select>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Foto Dokumentasi</div>
            <div style="display:flex;">
            	<div style="
            		padding:20px;
            		border:1px solid gainsboro;
            		border-radius:10px;
            		background:black;
            		color:white;
            		cursor:pointer;
            		margin:20px 0;
            	" id=addPhoto>Pilih Foto</div>
            </div>
            <div style=display:flex;margin-top:10px;gap:10px;overflow:auto; id=photoParent>
            </div>
          </div>
          <div>
        </div>
			`,
			data:{},
			async displayFile(){
				this.photoParent.innerHTML = '';
				for(let i=0;i<this.fileInput.files.length;i++){
					const file = this.fileInput.files[i];
					const data = await this.putImage(file);
					this.photoParent.addChild(makeElement('div',{
						style:`
							width:200px;
              height: 200px;
              background:whitesmoke;
              border:1px solid gainsboro;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
						`,
						innerHTML:`
							<img src="${data}" style="max-width:100%;max-height:100%;object-fit:cover;">
						`
					}))
				}
			},
			putImage(file){
				return new Promise((resolve,reject)=>{
					const fr = new FileReader();
					fr.onload = ()=>{
						resolve(fr.result);
					}
					fr.readAsDataURL(file);
				})
			},
			collectData(){
				this.findall('input').forEach(input=>{
					this.data[input.id] = input.value;
				})
				this.findall('textarea').forEach(input=>{
					this.data[input.id] = input.value;
				})
				this.findall('select').forEach(option=>{
					this.data[option.id] = option.value;
				})

				this.data.files = this.fileInput.files;

				//validating the data
				let valid = true;
				for(let i in this.data){
					if(typeof this.data[i] === 'string' && this.data[i].length === 0){
						valid = false;
						break;
					}
				}

				if(!valid)
					return alert('Maaf, mohon lengkapi kembali data anda!');

				this.doSavingProcess();
			},
			onadded(){
				this.photoParent = this.find('#photoParent');
				this.saveProcessUi = this.find('#saveProcessUi');
				this.setLabel = this.find('#stateLabel');
				this.fileInput = makeElement('input',{
					type:'file',
					multiple:true,
					accept:'image/*',
					onchange:()=>{
						this.displayFile();
					}
				})
				this.find('#backbutton').onclick = ()=>{
					app.topLayer.hide();
					this.remove();
				}
				this.find('#addPhoto').onclick = ()=>{
					this.fileInput.click();
				}
				this.find('#saveData').onclick = ()=>{
					this.collectData();
				}

				//generate residata.
				this.generateResi();
			},
			generateResi(){
				this.data.resi = `FFID${new Date().getTime()}`;
				this.find('#resi').value = this.data.resi;
			},
			async doSavingProcess(){
				this.saveProcessUi.show('flex');
				//handling files
				
				if(this.data.files.length > 0){
					this.data.files = await this.uploadFiles();
				}
				this.setLabel.innerText = `Menyimpan Data...`;
				await firebase.database().ref(`/orders/${this.data.resi}`).set(this.data);

				let message = '';
				message += 'Hallo Kak '+this.data.name+'.\n\n';
				message += 'Terimakasih sudah menggunakan layanan kami.\n';
				message += 'Nomor Resi: *'+this.data.resi+'*\n\n';
				message += 'Salam, FfStudio.';
				const fonnteResult = await app.sendWaNotif(this.data.number,message);
				if(!fonnteResult.status)
					alert(`Gagal Mengirim Pesan WA! ${fonnteResult.reason}`);

				this.setLabel.innerHTML = `
					<div style=font-size:24px;>Data Berhasil Simpan</div>
					<div>
						<div>Resi Id</div>
						<div>
							<input value="${this.data.resi}" readonly>
						</div>
					</div>
					<div style="
						background:black;
						color:white;
						padding:20px;
						border-radius:8px;
						cursor:pointer;
					" id=backbutton>Kembali</div>
				`;

				this.setLabel.find('#backbutton').onclick = ()=>{
					app.topLayer.hide();
					app.opentablesnav();
					this.remove();
				}
			},
			uploadFiles(){
				return new Promise(async (resolve,reject)=>{
					const fileUrl = [];
					for(let i=0;i<this.data.files.length;i++){
						this.setLabel.innerText = `Mengupload file ${i+1}/${this.data.files.length}.`;
						const file = this.data.files[i];
						const result = await firebase.storage().ref().child(file.name).put(file,file.contentType);
						fileUrl.push(await result.ref.getDownloadURL());
					}
					resolve(fileUrl);
				})
			}
		}))

		this.topLayer.show('flex');
	},
	async openSettings(){

		const webdata = (await firebase.database().ref('websettings').get()).val();

		this.topLayer.addChild(makeElement('div',{
			style:`
				background:white;
				height:90%;
				border:1px solid gainsboro;
				border-radius:10px;
				display:flex;
				flex-direction:column;
				overflow:hidden;
				position:relative;
			`,
			className:'NewOrderWidth',
			innerHTML:`
				<div style="
					z-index:1;
					position:absolute;
					top:10px;
					background:white;
					width:100%;
					height:100%;
					display:none;
					align-items:center;
					justify-content:center;
					flex-direction:column;
					font-size:16px;
				" id=saveProcessUi>
					<div id=stateLabel style="
						display: flex;
				    flex-direction: column;
				    gap: 20px;
				    justify-content: center;
				    align-items: center;
					">-</div>
				</div>
				<div style="
          padding:24px;
          border-bottom:2px solid gainsboro;
          position: relative;
        ">
        	<div style="
            position: absolute;
            top:0;left: 0;
            padding:20px;
          ">
            <img src=./more/media/back.png style="
              width:24px;
              height:24px;
              cursor: pointer;
            " id=backbutton>
          </div>
          <div style="font-size:18px;text-align: center;">Pengaturan Baru</div>
        </div>
        <div style="
          padding:24px;
          overflow: auto;
          height: 100%;
        ">
        	<div style="margin-bottom:20px;position:sticky;top:0;">
        		<div style="
        			padding:20px;
        			background:black;
        			color:white;
        			border-radius:10px;
        			text-align:center;
        			cursor:pointer;
        		" id=saveData>Simpan Perubahan</div>
        	</div>
          <div style=margin-bottom:15px; hidden>
            <div>Nomor Resi</div>
            <div style=display:flex;margin-top:10px;>
              <input id=resi readonly>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Web Title</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Nama Pelanggan..." id=webtitle>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Header Title</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Alamat Penanganan..." id=headertitle>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Nama Facebook</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Kontak Pelanggan..." id=fb_label>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Link Facebook</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Jenis Jasa..." id=fb_link>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Username Whatsapp</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Jenis Barang..." id=wa_label>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Link Whatsapp</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Model Barang..." id=wa_link>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Alamat</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Data Kerusakan..." id=map_label>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Link Map</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Data Kerusakan..." id=map_link>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Token Fonnte</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Data Kerusakan..." id=fonntetoken>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Ubah Profile</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Data Kerusakan..." id=profilepic type=file accept=image/*>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Ubah Background</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Data Kerusakan..." id=backgroundpic type=file accept=image/*>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Tampilkan Background</div>
            <div style=display:flex;margin-top:10px;>
              <select id=usebackground>
              	<option value=1>Ya</option>
              	<option value=0>Tidak</option>
              </select>
            </div>
          </div>
        </div>
			`,
			data:{},
			putImage(file){
				return new Promise((resolve,reject)=>{
					const fr = new FileReader();
					fr.onload = ()=>{
						resolve(fr.result);
					}
					fr.readAsDataURL(file);
				})
			},
			collectData(){
				this.findall('input').forEach(input=>{
					if(input.type==='file'){
						this.data[input.id] = input.files[0];
					}else this.data[input.id] = input.value;
				})
				this.findall('textarea').forEach(input=>{
					this.data[input.id] = input.value;
				})
				this.findall('select').forEach(option=>{
					this.data[option.id] = option.value;
				})

				this.data.files = this.fileInput.files;

				//validating the data
				let valid = true;
				for(let i in this.data){
					if(!this.data[i]){
						delete this.data[i];
					}
					if(typeof this.data[i] === 'string' && this.data[i].length === 0){
						valid = false;
						break;
					}
				}

				if(!valid)
					return alert('Maaf, mohon lengkapi kembali data anda!');
				this.doSavingProcess();
			},
			onadded(){
				// this.photoParent = this.find('#photoParent');
				this.saveProcessUi = this.find('#saveProcessUi');
				this.setLabel = this.find('#stateLabel');
				this.fileInput = makeElement('input',{
					type:'file',
					multiple:true,
					accept:'image/*',
					onchange:()=>{
						this.displayFile();
					}
				})
				this.find('#backbutton').onclick = ()=>{
					app.topLayer.hide();
					this.remove();
				}
				// this.find('#addPhoto').onclick = ()=>{
				// 	this.fileInput.click();
				// }
				this.find('#saveData').onclick = ()=>{
					this.collectData();
				}

				//generate residata.
				this.generateResi();

				this.showOldData();
			},
			showOldData(){
				for(let i in webdata){
					const input = this.find(`#${i}`);
					if(input && input.type !== 'file'){
						input.value = webdata[i];
					}
				}
			},
			generateResi(){
				this.data.resi = `FFID${new Date().getTime()}`;
				this.find('#resi').value = this.data.resi;
			},
			async doSavingProcess(){
				this.saveProcessUi.show('flex');
				//handling files
				
				if(this.data.backgroundpic || this.data.profilepic){
					await this.uploadFiles();
				}
				this.setLabel.innerText = `Menyimpan Data...`;
				await firebase.database().ref(`/websettings`).update(this.data);

				this.setLabel.innerHTML = `
					<div style=font-size:24px;>Data Berhasil Simpan</div>
					<div style="
						background:black;
						color:white;
						padding:20px;
						border-radius:8px;
						cursor:pointer;
					" id=backbutton>Kembali</div>
				`;

				this.setLabel.find('#backbutton').onclick = ()=>{
					app.topLayer.hide();
					this.remove();
				}
			},
			uploadFiles(){
				return new Promise(async (resolve,reject)=>{
					const libs = ['backgroundpic','profilepic'];
					for(let i=0;i<libs.length;i++){
						this.setLabel.innerText = `Mengupload file ${i+1}/${libs.length}.`;
						const file = this.data[libs[i]];
						if(!file)
							continue;
						const result = await firebase.storage().ref().child(file.name).put(file,file.contentType);
						this.data[libs[i]] = await result.ref.getDownloadURL();
					}
					resolve();
				})
			}
		}))

		this.topLayer.show('flex');
	},
	async delete(ffid){
		try{
			await firebase.database().ref(`/${ffid}`).remove();
			alert('Data Berhasil Dihapus!');
			this.opentablesnav();
		}catch(e){
			alert('Terjadi kesalahan!');
		}
	},
	async edit(ffid){
		let data = await firebase.database().ref(`/orders/${ffid}`).get();
		data = data.val();

		if(!data)
			return alert('Gagal memuat data/data tidak lagi tersedia!');

		this.topLayer.addChild(makeElement('div',{
			style:`
				background:white;
				height:90%;
				border:1px solid gainsboro;
				border-radius:10px;
				display:flex;
				flex-direction:column;
				overflow:hidden;
				position:relative;
			`,
			className:'NewOrderWidth',
			innerHTML:`
				<div style="
					z-index:1;
					position:absolute;
					top:10px;
					background:white;
					width:100%;
					height:100%;
					display:none;
					align-items:center;
					justify-content:center;
					flex-direction:column;
					font-size:16px;
				" id=saveProcessUi>
					<div id=stateLabel style="
						display: flex;
				    flex-direction: column;
				    gap: 20px;
				    justify-content: center;
				    align-items: center;
					">-</div>
				</div>
				<div style="
          padding:24px;
          border-bottom:2px solid gainsboro;
          position: relative;
        ">
        	<div style="
            position: absolute;
            top:0;left: 0;
            padding:20px;
          ">
            <img src=./more/media/back.png style="
              width:24px;
              height:24px;
              cursor: pointer;
            " id=backbutton>
          </div>
          <div style="font-size:18px;text-align: center;">Edit Pesanan</div>
        </div>
        <div style="
          padding:24px;
          overflow: auto;
          height: 100%;
        ">
        	<div style="margin-bottom:20px;position:sticky;top:0;">
        		<div style="
        			padding:20px;
        			background:black;
        			color:white;
        			border-radius:10px;
        			text-align:center;
        			cursor:pointer;
        		" id=saveData>Simpan Pesanan</div>
        	</div>
          <div style=margin-bottom:15px;>
            <div>Nomor Resi</div>
            <div style=display:flex;margin-top:10px;>
              <input id=resi readonly value='${data.resi}'>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Nama Pelanggan</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Nama Pelanggan..." id=name value='${data.name}'>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Alamat Pelanggan</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Alamat Penanganan..." id=address value='${data.address}'>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Kontak Pelanggan</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Kontak Pelanggan..." type=number id=number value='${data.number}'>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Jenis Jasa</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Jenis Jasa..." id=typeservices value='${data.typeservices}'>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Jenis Barang</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Jenis Barang..." id=typestuff value='${data.typestuff}'>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Model Barang</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Model Barang..." id=modelstuff value='${data.modelstuff}'>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Kerusakan</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Data Kerusakan..." id=problem value='${data.problem}'>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Status</div>
            <div style=display:flex;margin-top:10px;>
              <select id=status>
              	<option value=0 ${data.status === '0' ? 'selected' : ''}>Dalam Antrian</option>
              	<option value=1 ${data.status === '1' ? 'selected' : ''}>Diproses</option>
              	<option value=2 ${data.status === '2' ? 'selected readonly' : ''}>Selesai</option>
              </select>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Deskripsi Kerusakan</div>
            <div style=display:flex;margin-top:10px;>
              <textarea id=problemdes placeholder="Masukan Deskripsi Kerusakan...">${data.problemdes}</textarea>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Deskripsi Penanganan</div>
            <div style=display:flex;margin-top:10px;>
              <textarea id=handledes placeholder="Masukan Deskripsi Penanganan...">${data.handledes}</textarea>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Biaya Total</div>
            <div style=display:flex;margin-top:10px;>
              <input placeholder="Masukan Harga Total..." id=fullprice value='${data.fullprice}'>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Status Pembayaran</div>
            <div style=display:flex;margin-top:10px;>
              <select id=paystatus>
              	<option value=0 ${data.paystatus === '0' ? 'selected' : ''}>Belum Lunas</option>
              	<option value=1 ${data.paystatus === '1' ? 'selected readonly' : ''}>Lunas</option>
              </select>
            </div>
          </div>
          <div style=margin-bottom:15px;>
            <div>Foto Dokumentasi</div>
            <div style="display:flex;">
            	<div style="
            		padding:20px;
            		border:1px solid gainsboro;
            		border-radius:10px;
            		background:black;
            		color:white;
            		cursor:pointer;
            		margin:20px 0;
            	" id=addPhoto>Pilih Foto</div>
            </div>
            <div style=display:flex;margin-top:10px;gap:10px;overflow:auto; id=photoParent>
            </div>
          </div>
          <div>
        </div>
			`,
			data:{},
			async displayFile(){
				this.photoParent.innerHTML = '';
				for(let i=0;i<this.fileInput.files.length;i++){
					const file = this.fileInput.files[i];
					const data = await this.putImage(file);
					this.photoParent.addChild(makeElement('div',{
						style:`
							width:200px;
              height: 200px;
              background:whitesmoke;
              border:1px solid gainsboro;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
						`,
						innerHTML:`
							<img src="${data}" style="max-width:100%;max-height:100%;object-fit:cover;">
						`
					}))
				}
			},
			putImage(file){
				return new Promise((resolve,reject)=>{
					const fr = new FileReader();
					fr.onload = ()=>{
						resolve(fr.result);
					}
					fr.readAsDataURL(file);
				})
			},
			collectData(){
				this.findall('input').forEach(input=>{
					this.data[input.id] = input.value;
				})
				this.findall('textarea').forEach(input=>{
					this.data[input.id] = input.value;
				})
				this.findall('select').forEach(option=>{
					this.data[option.id] = option.value;
				})

				this.data.files = this.fileInput.files;

				//validating the data
				let valid = true;
				for(let i in this.data){
					if(typeof this.data[i] === 'string' && this.data[i].length === 0){
						valid = false;
						break;
					}
				}

				if(!valid)
					return alert('Maaf, mohon lengkapi kembali data anda!');

				this.doSavingProcess();
			},
			onadded(){
				this.photoParent = this.find('#photoParent');
				this.saveProcessUi = this.find('#saveProcessUi');
				this.setLabel = this.find('#stateLabel');
				this.fileInput = makeElement('input',{
					type:'file',
					multiple:true,
					accept:'image/*',
					onchange:()=>{
						this.displayFile();
					}
				})
				this.find('#backbutton').onclick = ()=>{
					app.topLayer.hide();
					this.remove();
				}
				this.find('#addPhoto').onclick = ()=>{
					this.fileInput.click();
				}
				this.find('#saveData').onclick = ()=>{
					this.collectData();
				}

				//show included foto
				this.showIncludedFoto();
			},
			showIncludedFoto(){
				if(!data.files)
					return;
				for(let i=0;i<data.files.length;i++){
					const src = data.files[i];
					this.photoParent.addChild(makeElement('div',{
						style:`
							width:200px;
              height: 200px;
              background:whitesmoke;
              border:1px solid gainsboro;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
						`,
						innerHTML:`
							<img src="${src}" style="max-width:100%;max-height:100%;object-fit:cover;">
						`
					}))
				}
			},
			async doSavingProcess(){
				this.saveProcessUi.show('flex');
				//handling files
				
				if(this.data.files.length > 0){
					this.data.files = await this.uploadFiles();
				}
				this.setLabel.innerText = `Menyimpan Data...`;
				await firebase.database().ref(`/orders/${this.data.resi}`).set(this.data);

				let message = '';
				message += 'Hallo Kak '+this.data.name+'.\n\n';
				message += 'Kami sudah memperbarui data pesanan, mohon segera dicek.\n';
				message += 'Nomor Resi: *'+this.data.resi+'*\n\n';
				message += 'Salam, FfStudio.';
				const fonnteResult = await app.sendWaNotif(this.data.number,message);
				if(!fonnteResult.status)
					alert(`Gagal Mengirim Pesan WA! ${fonnteResult.reason}`);

				this.setLabel.innerHTML = `
					<div style=font-size:24px;>Data Berhasil Diedit</div>
					<div>
						<div>Resi Id</div>
						<div>
							<input value="${this.data.resi}" readonly>
						</div>
					</div>
					<div style="
						background:black;
						color:white;
						padding:20px;
						border-radius:8px;
						cursor:pointer;
					" id=backbutton>Kembali</div>
				`;

				this.setLabel.find('#backbutton').onclick = ()=>{
					app.topLayer.hide();
					app.opentablesnav();
					this.remove();
				}
			},
			uploadFiles(){
				return new Promise(async (resolve,reject)=>{
					const fileUrl = [];
					for(let i=0;i<this.data.files.length;i++){
						this.setLabel.innerText = `Mengupload file ${i+1}/${this.data.files.length}.`;
						const file = this.data.files[i];
						const result = await firebase.storage().ref().child(file.name).put(file,file.contentType);
						fileUrl.push(await result.ref.getDownloadURL());
					}
					resolve(fileUrl);
				})
			}
		}))

		this.topLayer.show('flex');
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
	},
	opendashboardnav(){
		this.dashboard.clear();
		this.dashboard.style.overflowY = 'hidden';
		this.showDashBoard();
	},
	opentablesnav(){
				this.dashboard.clear();
		this.dashboard.style.overflowY = 'auto';
		this.showTables();
	},
	initNavButtonsAdmin(){
		findall('.navitems').forEach(item=>{
			item.onclick = ()=>{
				this[`open${item.id}`]();
			}
		})
	},
	async sendWaNotif(target,message){
		const tokenfonnte = (await firebase.database().ref('/websettings/fonntetoken').get()).val();
		if(!tokenfonnte){
			return {status:false,reason:'Token Fonnte Tidak Boleh Kosong!'};
		}
		let url = 'https://api.fonnte.com/send';
		let data = {
		    target,
		    message,
		    countryCode: '62'
		};
		let headers = {
		  'Authorization': tokenfonnte, // change TOKEN to your actual token
			'Content-type':'application/json'
		};
		return new Promise((resolve,reject)=>{
			fetch(url, {
		    method: 'POST',
		    headers: headers,
		    body: JSON.stringify(data)
			}).then(response => response.json())
			.then(data => {
			    resolve(data);
			})
			.catch((error) => {
			    console.error('Error:', error);
			});
		})
	}
}

app.init();
