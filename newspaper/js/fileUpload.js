fileUpload = {
    init() {
;( function( $, window, document, undefined ) {
	$( '.inputfile' ).each( function()
	{
		var $input	 = $( this ),
			$label	 = $input.next( 'label' ),
			labelVal = $label.html();

		$input.on( 'change', function(e) {
			var fileName = '';
			let fileNames = [];
			if( this.files && this.files.length > 1 ) {
				for (i = 0; i < e.target.files.length; i++) {
					fileNames.push(e.target.files[i].name);
				}
				fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
			} else if( e.target.value ) {
				fileName = e.target.value.split('\\').pop();
				fileNames.push(fileName);
			}
			textedit.imgNames = fileNames;
			textedit.imgNr();
			if( fileName ) {
				$label.find( 'span' ).html( fileName );
			} else {
				$label.html( labelVal );
			}
		});
		$input
		.on( 'focus', function(){ $input.addClass( 'has-focus' ); })
		.on( 'blur', function(){ $input.removeClass( 'has-focus' ); });

	});
})( jQuery, window, document );
    }
}