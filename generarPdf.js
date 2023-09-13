const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')
const { format } = require('date-fns')
const pathToCalibri = './Calibri Regular.ttf'
const pathToCalibriBold = './Calibri Bold.ttf'
const pathToCalibriItalic = './Calibri Italic.ttf'
const nodemailer = require('nodemailer')
require('dotenv').config()

// Función para implementar el retraso
function customDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function generarPDF(students, lastNumber, selectedDirectory) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user:'gimenapimba@gmail.com',
            pass: process.env.PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
      });
      

    const { es } = require('date-fns/locale');

    // Obtener la fecha actual
    const currentDate = new Date();
    
    // Configurar en español para el formato de fecha
    const esLocale = es;

    // students.forEach(async (student, index) => {
        for (const [index, student] of students.entries()) {
    const doc = new PDFDocument();
    const currentNumber = lastNumber + index; // +1 en cada iteración
    const outputFileName = `${student.ALUMNO}_20230${currentNumber}.pdf`
    const outputPath = path.join(selectedDirectory, outputFileName) // se guarda donde selecciona el usuario 

        //  fecha actual y formateo
        const currentDate = new Date()
        const formattedDate = format(currentDate, 'dd/MM/yyyy')
    
    doc.pipe(fs.createWriteStream(outputPath))

   // todo lo q es contenido del pdf
   doc.image('./logo.jpg', 50, 50, { width: 200, height: 90 })


   // Info debajo del logo
   doc.font(pathToCalibri).fillColor('gray').fontSize(10).text('www.oposicionesarquitectos.com', 70, 160)
   doc.font('Calibri').fillColor('blue').fontSize(9).text('info@oposicionesarquitectos.com', 70, 175, { link: 'mailto:info@oposicionesarquitectos.com', underline: true })
   

   // Info academia
   const rightColumnX = 350
   const rightColumnY = 100
   const rightColumnWidth = 200
   const rightColumnHeight = 20
 
   doc.font(pathToCalibriBold).fontSize(12).fillColor('black').text('OPOSICIONES ARQUITECTOS', rightColumnX, rightColumnY, { align: 'right', width: rightColumnWidth, height: rightColumnHeight, lineGap: 10 })
   doc.font(pathToCalibri).fontSize(11).fillColor('gray').text('CIF: B01983758', { align: 'right', width: rightColumnWidth, height: rightColumnHeight, lineGap: 5 })
   doc.font(pathToCalibri).fontSize(11).fillColor('gray').text('C/. Molino de la Navata, 59', { align: 'right', width: rightColumnWidth, height: rightColumnHeight, lineGap: 5 })
   doc.font(pathToCalibri).fontSize(11).fillColor('gray').text('28260 - Galapagar - Madrid', { align: 'right', width: rightColumnWidth, height: rightColumnHeight, lineGap: 5 })
   
   // Línea separadora
   doc.moveTo(50, 200).lineTo(550, 200).stroke()
   


   // Datos del alumno, nro factura...se deberá cambiar cada año o modificar el 2023 por el año en curso
   doc.font(pathToCalibriBold).fontSize(13).fillColor('black').text(` ${student.ALUMNO}`, 50, 220)
   doc.font(pathToCalibri).fontSize(11).fillColor('gray').text(`NIF: ${student.DNI}`, 70, 245)
   doc.font(pathToCalibriBold).fontSize(12).fillColor('black').text(`Num. Factura:  20230${currentNumber}`,400, 245 )
   doc.font(pathToCalibri).fontSize(11).fillColor('gray').text(`${student.DIRECCION}`, 70, 265)
   doc.font(pathToCalibriBold).fontSize(12).fillColor('black').text(`Fecha:  ${formattedDate}`, 400, 265)
   doc.font(pathToCalibri).fontSize(11).fillColor('gray').text(`${student.CODIGOPOSTAL} - ${student.CIUDAD} - ${student.PROVINCIA}`, 70, 285)

   // Concepto (palabra)
   doc.font(pathToCalibriBold).fontSize(12).fillColor('black').text('Concepto', 50, 320)

   // Línea separadora
   doc.moveTo(50, 340).lineTo(550, 340).stroke()

   // Descripción y curso (es el concepto)
  doc.font(pathToCalibri).fontSize(10).fillColor('gray').text(`${student.DESCRIPCION} ${student.CURSO}`, 50, 350)


   // Base imponible
   doc.font(pathToCalibriBold).fontSize(13).fillColor('black').text(`Base imponible          ${student['TOTAL A PAGAR']}`, 340, 460, { align: 'right' })
 

   // IVA
   doc.font(pathToCalibriBold).fontSize(13).fillColor('black').text('IVA (0%)            - €', 340, 480, { align: 'right' })

   // Línea separadora doble
   doc.moveTo(50, 510).lineTo(550, 510).stroke()
   doc.moveTo(50, 514).lineTo(550, 514).stroke()

   // Total a pagar
   doc.font(pathToCalibriBold).fontSize(16).fillColor('black').text(`Total (Euro)     ${student['TOTAL A PAGAR']} €`, 340, 530, { align: 'right'})


   // Pie de página
   doc.font(pathToCalibriItalic).fontSize(9).fillColor('gray').text(`"Enseñanza exenta de IVA Artículo 20 Uno 9º de la Ley 37/1992 de 28 de DICIEMBRE del Impuesto sobre el Valor Añadido"`, 50, 570, {align: 'center'} )
   doc.font(pathToCalibriItalic).fontSize(9).fillColor('gray').text("625 47 47 77 - info@oposicionesarquitectos.com www.oposicionesarquitectos.com",90,595, {align: 'center'} )
   doc.font(pathToCalibriItalic).fontSize(9).fillColor('gray').text("OPOSICIONES ARQUITECTOS - C/. Molino de la Navata, 59 28260 - Galapagar - Madrid", 85, 615, {align: 'center'})
  
   // texto final protección de datos, etc.
   const texto = "De acuerdo con lo establecido en el Reglamento (UE) 2016/679 de Protección de Datos de Carácter Personal (RGPD) procedemos a informarles que los datos personales que Ud. nos facilite serán tratados en nuestros sistemas de información con la finalidad de llevar a cabo la gestión interna del cliente. Todos o parte de los datos aportados serán comunicados a las administraciones públicas competentes. El titular de los datos se compromete a comunicar por escrito a OPOSICIONES ARQUITECTOS, S.L. cualquier modificación que se produzca en los datos aportados. usted podrá en cualquier momento ejercer sus derechos de acceso, rectificación, cancelación, oposición, limitación y portabilidad de datos en los términos establecidos en el RGPD mediante notificación escrita, adjuntando copia de su DNI o tarjeta identificativa, a OPOSICIONES ARQUITECTOS, S.L., con domicilio en Calle Molino de la Navata, 59 28260 Galapagar, o a nuestro correo info@oposicionesarquitectos.com Usted puede consultar nuestra política de Protección de Datos en www.oposicionesarquitectos.com"

   const textoSinSaltosDeLinea = texto.replace(/\n/g, '')
   
   doc.font(pathToCalibriItalic).fontSize(7).fillColor('black').text(textoSinSaltosDeLinea, 70, 655 ,{
     align: 'justify',
     width: 450,
     height: 300,
     lineGap: 3.5,
     indent: 10,
     ellipsis: true
   })
   

   
   // Finalizar el PDF
   doc.end()
   

// Enviar correo si ENVIAR es "SI"
if (student.ENVIAR === 'SI') {
    const invoice = `${student.ALUMNO}_20230${currentNumber}.pdf`;
    const recipient = student.EMAIL;
    const subject = 'Factura Oposiciones Arquitectos';
    const body = `Estimado/a ${student.ALUMNO}, adjunto encontrarás la factura correspondiente a ${format(
      currentDate,
      'MMMM',
      { locale: esLocale }
    )} de ${format(currentDate, 'yyyy')}.
    Un saludo`;
    const mailOptions = {
      from: 'Gimena pruebas <gimenapimba@gmail.com>',
      to: recipient,
      subject: subject,
      text: body,
      attachments: [
        {
          filename: invoice,
          path: path.join(selectedDirectory, invoice),
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Correo para el alumno: ${student.ALUMNO} enviado a ${student.EMAIL} adjuntando Factura ${currentNumber}`);


      // Retraso de 15 segundos antes de enviar el siguiente correo
      if (index < students.length - 1) {
        await customDelay(15000);
      }
    } catch (error) {
      console.error(`Error al enviar correo a ${student.ALUMNO}a la dirección ${student.EMAIL} no se ha enviado la factura${currentNumber}`, error);
    }
  }

  const message = `Factura ${currentNumber} guardada para el alumno: ${student.ALUMNO}`;
  console.log(message);

  if (index === students.length - 1) {
    console.log('FACTURAS GENERADAS Y GUARDADAS PARA TODOS LOS ALMUNOS/AS');
  }
}
}

module.exports = generarPDF;

// const PDFDocument = require('pdfkit')
// const fs = require('fs')
// const path = require('path')
// const { format } = require('date-fns')
// const pathToCalibri = './Calibri Regular.ttf'
// const pathToCalibriBold = './Calibri Bold.ttf'
// const pathToCalibriItalic = './Calibri Italic.ttf'
// const nodemailer = require('nodemailer')
// require('dotenv').config()

// // Función para implementar el retraso
// function customDelay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }
  
//   async function generarPDF(students, lastNumber, selectedDirectory, invoiceDate, invoiceMonth) {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user:'gimenapimba@gmail.com',
//             pass: process.env.PASSWORD,
//         },
//         tls: {
//             rejectUnauthorized: false,
//         },
//       });
      

//     const { es } = require('date-fns/locale');

//     // Obtener la fecha actual
//     const currentDate = new Date();
    
//     // Configurar en español para el formato de fecha
//     const esLocale = es;

//     // students.forEach(async (student, index) => {
//         for (const [index, student] of students.entries()) {
//     const doc = new PDFDocument();
//     const currentNumber = lastNumber + index; // +1 en cada iteración
//     const outputFileName = `${student.ALUMNO}_${currentNumber}.pdf`
//     const outputPath = path.join(selectedDirectory, outputFileName) // se guarda donde selecciona el usuario 

//         //  fecha actual y formateo
//         const currentDate = new Date()
//         const formattedDate = format(invoiceDate, 'dd/MM/yyyy')
    
//     doc.pipe(fs.createWriteStream(outputPath))

//    // todo lo q es contenido del pdf
//    doc.image('./logo.jpg', 50, 50, { width: 200, height: 90 })


//    // Info debajo del logo
//    doc.font(pathToCalibri).fillColor('gray').fontSize(10).text('www.oposicionesarquitectos.com', 70, 160)
//    doc.font('Calibri').fillColor('blue').fontSize(9).text('info@oposicionesarquitectos.com', 70, 175, { link: 'mailto:info@oposicionesarquitectos.com', underline: true })
   

//    // Info academia
//    const rightColumnX = 350
//    const rightColumnY = 100
//    const rightColumnWidth = 200
//    const rightColumnHeight = 20
 
//    doc.font(pathToCalibriBold).fontSize(12).fillColor('black').text('OPOSICIONES ARQUITECTOS', rightColumnX, rightColumnY, { align: 'right', width: rightColumnWidth, height: rightColumnHeight, lineGap: 10 })
//    doc.font(pathToCalibri).fontSize(11).fillColor('gray').text('CIF: B01983758', { align: 'right', width: rightColumnWidth, height: rightColumnHeight, lineGap: 5 })
//    doc.font(pathToCalibri).fontSize(11).fillColor('gray').text('C/. Molino de la Navata, 59', { align: 'right', width: rightColumnWidth, height: rightColumnHeight, lineGap: 5 })
//    doc.font(pathToCalibri).fontSize(11).fillColor('gray').text('28260 - Galapagar - Madrid', { align: 'right', width: rightColumnWidth, height: rightColumnHeight, lineGap: 5 })
   
//    // Línea separadora
//    doc.moveTo(50, 200).lineTo(550, 200).stroke()
   


//    // Datos del alumno, nro factura...se deberá cambiar cada año o modificar el 2023 por el año en curso
//    doc.font(pathToCalibriBold).fontSize(13).fillColor('black').text(` ${student.ALUMNO}`, 50, 220)
//    doc.font(pathToCalibri).fontSize(11).fillColor('gray').text(`NIF: ${student.DNI}`, 70, 245)
//    doc.font(pathToCalibriBold).fontSize(12).fillColor('black').text(`Num. Factura:  ${currentNumber}`,400, 245 )
//    doc.font(pathToCalibri).fontSize(11).fillColor('gray').text(`${student.DIRECCION}`, 70, 265)
//    doc.font(pathToCalibriBold).fontSize(12).fillColor('black').text(`Fecha:  ${formattedDate}`, 400, 265)
//    doc.font(pathToCalibri).fontSize(11).fillColor('gray').text(`${student.CODIGOPOSTAL} - ${student.CIUDAD} - ${student.PROVINCIA}`, 70, 285)

//    // Concepto (palabra)
//    doc.font(pathToCalibriBold).fontSize(12).fillColor('black').text('Concepto', 50, 320)

//    // Línea separadora
//    doc.moveTo(50, 340).lineTo(550, 340).stroke()

//    // Descripción y curso (es el concepto)
//   doc.font(pathToCalibri).fontSize(10).fillColor('gray').text(`${student.DESCRIPCION} ${student.CURSO}`, 50, 350)


//    // Base imponible
//    doc.font(pathToCalibriBold).fontSize(13).fillColor('black').text(`Base imponible          ${student['TOTAL A PAGAR']}`, 340, 460, { align: 'right' })
 

//    // IVA
//    doc.font(pathToCalibriBold).fontSize(13).fillColor('black').text('IVA (0%)            - €', 340, 480, { align: 'right' })

//    // Línea separadora doble
//    doc.moveTo(50, 510).lineTo(550, 510).stroke()
//    doc.moveTo(50, 514).lineTo(550, 514).stroke()

//    // Total a pagar
//    doc.font(pathToCalibriBold).fontSize(16).fillColor('black').text(`Total (Euro)     ${student['TOTAL A PAGAR']} €`, 340, 530, { align: 'right'})


//    // Pie de página
//    doc.font(pathToCalibriItalic).fontSize(9).fillColor('gray').text(`"Enseñanza exenta de IVA Artículo 20 Uno 9º de la Ley 37/1992 de 28 de DICIEMBRE del Impuesto sobre el Valor Añadido"`, 50, 570, {align: 'center'} )
//    doc.font(pathToCalibriItalic).fontSize(9).fillColor('gray').text("625 47 47 77 - info@oposicionesarquitectos.com www.oposicionesarquitectos.com",90,595, {align: 'center'} )
//    doc.font(pathToCalibriItalic).fontSize(9).fillColor('gray').text("OPOSICIONES ARQUITECTOS - C/. Molino de la Navata, 59 28260 - Galapagar - Madrid", 85, 615, {align: 'center'})
  
//    // texto final protección de datos, etc.
//    const texto = "De acuerdo con lo establecido en el Reglamento (UE) 2016/679 de Protección de Datos de Carácter Personal (RGPD) procedemos a informarles que los datos personales que Ud. nos facilite serán tratados en nuestros sistemas de información con la finalidad de llevar a cabo la gestión interna del cliente. Todos o parte de los datos aportados serán comunicados a las administraciones públicas competentes. El titular de los datos se compromete a comunicar por escrito a OPOSICIONES ARQUITECTOS, S.L. cualquier modificación que se produzca en los datos aportados. usted podrá en cualquier momento ejercer sus derechos de acceso, rectificación, cancelación, oposición, limitación y portabilidad de datos en los términos establecidos en el RGPD mediante notificación escrita, adjuntando copia de su DNI o tarjeta identificativa, a OPOSICIONES ARQUITECTOS, S.L., con domicilio en Calle Molino de la Navata, 59 28260 Galapagar, o a nuestro correo info@oposicionesarquitectos.com Usted puede consultar nuestra política de Protección de Datos en www.oposicionesarquitectos.com"

//    const textoSinSaltosDeLinea = texto.replace(/\n/g, '')
   
//    doc.font(pathToCalibriItalic).fontSize(7).fillColor('black').text(textoSinSaltosDeLinea, 70, 655 ,{
//      align: 'justify',
//      width: 450,
//      height: 300,
//      lineGap: 3.5,
//      indent: 10,
//      ellipsis: true
//    })
   

   
//    // Finalizar el PDF
//    doc.end()
   

// // Enviar correo si ENVIAR es "SI"
// if (student.ENVIAR === 'SI') {
//     const invoice = `${student.ALUMNO}_${currentNumber}.pdf`;
//     const recipient = student.EMAIL;
//     const subject = 'Factura Oposiciones Arquitectos';
//     const body = `Estimado/a ${student.ALUMNO}, adjunto encontrarás la factura correspondiente a ${invoiceMonth}.
//     Un saludo`;
//     const mailOptions = {
//       from: 'Gimena pruebas <gimenapimba@gmail.com>',
//       to: recipient,
//       subject: subject,
//       text: body,
//       attachments: [
//         {
//           filename: invoice,
//           path: path.join(selectedDirectory, invoice),
//         },
//       ],
//     };

//     try {
//       await transporter.sendMail(mailOptions);
//       console.log(`Correo para el alumno: ${student.ALUMNO} enviado a ${student.EMAIL} adjuntando Factura ${currentNumber}`);


//       // Retraso de 15 segundos antes de enviar el siguiente correo
//       if (index < students.length - 1) {
//         await customDelay(15000);
//       }
//     } catch (error) {
//       console.error(`Error al enviar correo a ${student.ALUMNO}a la dirección ${student.EMAIL} no se ha enviado la factura${currentNumber}`, error);
//     }
//   }

//   const message = `Factura ${currentNumber} guardada para el alumno: ${student.ALUMNO}`;
//   console.log(message);

//   if (index === students.length - 1) {
//     console.log('FACTURAS GENERADAS Y GUARDADAS PARA TODOS LOS ALMUNOS/AS');
//   }
// }
// }

// module.exports = generarPDF;